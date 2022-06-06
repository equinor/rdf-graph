import { LayoutWrapper, SparqlGraphProps, TurtleGraphError, UiConfigProps } from './SparqlGraph.types';
import { layoutCola, layoutCoseBilKent, layoutDagre } from '../../utils';
import Cytoscape, { SingularElementArgument } from 'cytoscape';
import { postProcessElements, postUpdateElements, rdfTriples2Elements, turtle2Elements } from '../../mapper';
import { useEffect, useState } from 'react';
import cytoscape, { ElementDefinition } from 'cytoscape';
import CytoscapeComponent from 'react-cytoscapejs';
import { RdfPatch, GraphSelection } from '../../models';
import { rdfObjectKey, rdfPredicateKey, rdfSubjectKey } from './cytoscapeDataKeys';
import { NodeType } from '../../models/nodeType';
import { Quad, DataFactory } from 'n3';
import { partition } from '../../utils/partition';

const { namedNode } = DataFactory;

const defaultUiConfig: UiConfigProps = {
	css: { height: '100vh', width: '100%' },
	minZoom: 0.4,
	maxZoom: 2,
	zoom: undefined,
	zoomingEnabled: true,
};

const layouts: LayoutWrapper[] = [
	{ name: 'Cose-Bilkent', layout: layoutCoseBilKent },
	{ name: 'Cola', layout: layoutCola },
	{ name: 'Dagre', layout: layoutDagre },
];

export const SparqlGraph = ({ turtleString, layoutName, patches, uiConfig, onElementsSelected }: SparqlGraphProps) => {
	const selectedLayout = layouts.find((lt) => lt.name === layoutName)!.layout;
	const [elements, setElements] = useState<ElementDefinition[]>([]);

	const [nullableCy, setCy] = useState<cytoscape.Core>();

	const prepareCytoscapeElements = async () => {
		const elements = await turtle2Elements(turtleString);
		const postProcessed = postProcessElements(elements);
		setElements(postProcessed);
	};

	const initialize = (cy: cytoscape.Core) => {
		cy.on('select', () => {
			onElementsSelected(
				new GraphSelection(
					cy.$('node:selected').map((n) => n.data()),
					cy.$('edge:selected').map(createQuad)
				)
			);
		});

		cy.on('unselect', () => {
			if (cy.$(':selected').length === 0) {
				onElementsSelected(new GraphSelection([], []));
			}
		});
	};

	const createQuad = (element: SingularElementArgument): Quad =>
		new Quad(namedNode(element.data(rdfSubjectKey)), namedNode(element.data(rdfPredicateKey)), namedNode(element.data(rdfObjectKey)));

	useEffect(() => {
		prepareCytoscapeElements();
	}, [turtleString]);

	useEffect(() => {
		if (nullableCy) {
			const cy = nullableCy!;
			cy.ready(() => {
				cy.ready(() => cy.elements('[!layoutIgnore]').layout(selectedLayout).run());
			});
		}
	}, [nullableCy, elements]);

	const setCytoscapeHandle = (cy: Cytoscape.Core) => {
		if (nullableCy) return; // Already initialized
		initialize(cy);
		setCy(cy);
	};

	const createSelector = (key: string, value: string) => {
		return `[${key}='${value}']`;
	};

	const applyPatch = (patch: RdfPatch) => {
		if (!nullableCy) return;
		const cy = nullableCy;
		const newAdditions = rdfTriples2Elements(patch.tripleAdditions);

		console.log('newAdditions', newAdditions);
		const [edgeTriples, dataTriples] = partition<Quad>((q) => q.object.termType === 'NamedNode', patch.tripleRemovals);

		edgeTriples.forEach((q) =>
			cy.remove(
				'edge' +
					createSelector(rdfSubjectKey, q.subject.value) +
					createSelector(rdfPredicateKey, q.predicate.value) +
					createSelector(rdfObjectKey, q.object.value)
			)
		);

		dataTriples.forEach((q) => {
			const nodes = cy.nodes(`node${createSelector('id', q.subject.value)}`);
			if (nodes.length === 0) {
				throw new TurtleGraphError(`Unable to find node with id=${q.subject.value}`);
			}
			// TODO find out how to remove nested data
			// const keyToRemove = `rdfData[${q.predicate.value}]`;
			//nodes.removeData(keyToRemove);
		});

		postUpdateElements(newAdditions, cy);
	};

	useEffect(() => {
		const patch = patches.length > 0 && patches.at(-1);
		patch && applyPatch(patch);
	}, [patches]);

	useEffect(() => {
		if (nullableCy) {
			const els = nullableCy.elements('[!layoutIgnore]');
			els.layout(selectedLayout).run();
		}
	}, [selectedLayout]);

	return (
		<CytoscapeComponent
			elements={elements}
			style={uiConfig?.css ?? defaultUiConfig.css}
			stylesheet={[
				{
					selector: `[nodeType = "${NodeType.SymbolContainer}"]`,
					style: {
						shape: 'rectangle',
						'background-color': 'red',
						'background-opacity': 0,
						'border-width': 0,
					},
				},
				{
					selector: `[nodeType = "${NodeType.SymbolImage}"]`,
					style: {
						shape: 'rectangle',
						'background-clip': 'none',
						'background-fit': 'contain',
						'background-image': 'data(image)',
						'background-height': 'data(imageHeight)',
						'background-width': 'data(imageWidth)',
						width: 'data(imageHeight)',
						height: 'data(imageHeight)',
						'background-color': 'blue',
						'background-opacity': 0,
						'border-width': 0,
						'padding-bottom': '0px',
						events: 'no',
					},
				},
				{
					selector: `[nodeType = "${NodeType.SymbolConnector}"]`,
					style: {
						shape: 'rectangle',
						height: '8px',
						width: '8px',
						'background-color': 'red',
						'background-opacity': 0.7,
						'border-width': 0,
					},
				},
				{
					selector: ':selected',
					style: {
						'border-style': 'dashed',
						'border-color': 'blue',
						'border-width': 2,
					},
				},
				{
					selector: '[color]',
					style: {
						'background-color': 'data(color)',
					},
				},
				{
					selector: 'edge',
					style: {
						'curve-style': 'taxi',
						width: '1px',
						color: 'black',
						'line-color': 'black',
						'target-arrow-color': '#ccc',
						'target-arrow-fill': 'filled',
						'target-arrow-shape': 'chevron',
						'arrow-scale': 1.5,
					},
				},
			]}
			maxZoom={uiConfig?.maxZoom ?? defaultUiConfig.maxZoom}
			minZoom={uiConfig?.minZoom ?? defaultUiConfig.minZoom}
			zoom={uiConfig?.zoom ?? defaultUiConfig.zoom}
			zoomingEnabled={uiConfig?.zoomingEnabled ?? defaultUiConfig.zoomingEnabled}
			cy={(x) => setCytoscapeHandle(x)}
		/>
	);
};
