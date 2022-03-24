import { FC, FormEvent, useEffect, useRef, useState } from 'react';
import { MultiSelect, Slider } from '@equinor/eds-core-react';
import CytoscapeComponent from 'react-cytoscapejs';
import Cytoscape, { EdgeCollection, NodeCollection } from 'cytoscape';

import { layoutCoseBilKent, loadAdjacentData, loadLiteralData, layoutDagre, layoutCola, onlyUnique, useMappers } from '../../utils';
import { ChartInterfaceProps, CytoscapeLayout, LayoutWrapper } from './ChartInterface.types';
import { useTurtleHelpers } from '../../mapper';
import { Details } from '../../components';
import { Edge } from '../../models';
import { useCytoscapeHelpers } from '../../hooks';

import './ChartInterface.scss';

export const ChartInterface: FC<ChartInterfaceProps> = ({ isStrictMode, environment, turtle, layout }: ChartInterfaceProps): JSX.Element => {
	const layouts: LayoutWrapper[] = [
		{ name: CytoscapeLayout['Cose-Bilkent'], layout: layoutCoseBilKent },
		{ name: CytoscapeLayout.Cola, layout: layoutCola },
		{ name: CytoscapeLayout.Dagre, layout: layoutDagre },
	];

	const [selectedElement, setSelectedElement] = useState<string>('No elements selected');
	const [possibleEdgeTypes, setPossibleEdgeTypes] = useState<string[]>([]);
	const selectedEdgeTypesRef = useRef<string[]>([]);
	const [allEdges, setAllEdges] = useState<Edge[]>([]);
	const limitRef = useRef<number>(5);
	const [literalResults, setLiteralResults] = useState<string>('');
	const [nullableCy, setCy] = useState<Cytoscape.Core>();
	const [turtle2Edges] = useTurtleHelpers();

	const [getCytoscapeElementsByEdges] = useCytoscapeHelpers();
	const [, cytoscapeEdgeId2Edge] = useMappers();

	const defaultLayout = layouts.filter((lt) => lt.layout.name === layout?.toLocaleLowerCase())[0];
	const currentLayout = defaultLayout.layout;

	const runCytoscape = (ct: Cytoscape.Core) => {
		if (nullableCy) return;

		setCy(ct);
	};

	const elementCollection2Ids = (collection: NodeCollection | EdgeCollection): string[] => {
		const ids: string[] = [];

		collection.forEach((element) => {
			if (element.id()) {
				ids.push(element.id());
			}
		});
		return ids;
	};

	const construct = async () => {
		const edges = await turtle2Edges(turtle);

		if (edges && edges.length > 0) setAllEdges(edges);
	};

	const runConstruct = () => {
		if (!nullableCy) return;

		nullableCy.elements().remove();
		construct();
	};

	useEffect(() => runConstruct(), [turtle, isStrictMode]);

	useEffect(() => {
		if (nullableCy) {
			const cytoscapeElements = getCytoscapeElementsByEdges(allEdges, isStrictMode);
			nullableCy.add(cytoscapeElements);

			const edgeTypes = allEdges.map((e) => e.type).filter(onlyUnique);
			setPossibleEdgeTypes(edgeTypes);
			setupCytoscape(nullableCy);
		}
	}, [allEdges, isStrictMode]);

	useEffect(() => {
		nullableCy && nullableCy.layout(currentLayout).run();
	}, [currentLayout]);

	const changeHandler = (_event: FormEvent<HTMLDivElement>, value: number[] | number) => {
		limitRef.current = value as number;
	};

	const setupCytoscape = async (cy: Cytoscape.Core) => {
		cy.layout(currentLayout).run();
		cy.on('tap', async (event) => {
			if (!event.target?.group) return;

			if (event.target.group() === 'edges') {
				setSelectedElement(cytoscapeEdgeId2Edge(event.target.id()).type);
			}
			if (event.target.group() === 'nodes') {
				const target = event.target.id();
				setSelectedElement(target);
				if (limitRef.current > 0) {
					const target = event.target.id();
					setSelectedElement(target);

					const edgeAdditions = await loadAdjacentData(
						target,
						elementCollection2Ids(cy.edges()),
						selectedEdgeTypesRef.current,
						limitRef.current,
						environment
					);

					if (edgeAdditions.length > 0) {
						cy.nodes().forEach((node) => {
							node.lock();
						});

						const cytoscapeElements = getCytoscapeElementsByEdges(edgeAdditions, isStrictMode);

						cy.add(cytoscapeElements);
						const subLayout = cy.makeLayout(currentLayout);
						subLayout.run();
						subLayout.on('layoutstop', () => {
							cy.nodes().forEach((node) => {
								node.unlock();
							});
						});
					}

					const literals = await loadLiteralData(target, environment);
					setLiteralResults(literals.content);
				}
			}
		});
	};

	return (
		<div className="ChartInterface">
			<div className="ChartInterface___vertical-menu">
				<h2> {selectedElement} </h2>
				<MultiSelect
					items={possibleEdgeTypes}
					defaultChecked={true}
					label="Filter edge types"
					handleSelectedItemsChange={(x) => {
						selectedEdgeTypesRef.current = x.selectedItems ?? selectedEdgeTypesRef.current;
					}}
				/>
				<Slider
					ariaLabelledby="Limit new edges"
					value={5}
					min={0}
					max={1000}
					step={5}
					minMaxDots={false}
					minMaxValues={false}
					onChange={changeHandler}
				/>
				<Details resultAsString={literalResults} isAlphabetised />
			</div>
			<div className="ChartInterface__content">
				<CytoscapeComponent
					elements={[]}
					style={{ width: '100%', height: '100vh' }}
					stylesheet={[
						{
							selector: 'node',
							style: {
								label: 'data(label)',
								width: '60%',
								height: '60%',
								//'text-transform': 'lowercase',
								'text-max-width': '150px',
								'text-wrap': 'wrap',
								'text-halign': 'center',
								'text-valign': 'bottom',
								'background-fit': 'contain',
							},
						},
						{
							selector: '[image]',
							style: {
								shape: 'rectangle',
								'background-image': 'data(image)',
								'background-opacity': 0,
							},
						},
						{
							selector: '[color]',
							style: {
								'background-color': 'data(color)',
							},
						},
						{
							selector: 'node:parent',
							style: {
								shape: 'cut-rectangle',
								'padding-bottom': '5%',
								'padding-top': '5%',
								'padding-left': '5%',
								'padding-right': '5%',
							},
						},
						{
							selector: 'edge',
							style: {
								width: 4,
								'line-color': '#ccc',
								'target-arrow-color': '#ccc',
								'target-arrow-fill': 'filled',
								'target-arrow-shape': 'chevron',
								'arrow-scale': 1.5,
								'curve-style': 'bezier',
							},
						},
					]}
					maxZoom={2}
					minZoom={0.02}
					cy={(x) => runCytoscape(x)}
				/>
			</div>
		</div>
	);
};
