import { LayoutWrapper, SparqlGraphProps, UiConfigProps } from './SparqlGraph.types';
import { layoutCola, layoutCoseBilKent, layoutDagre } from '../../utils';
import Cytoscape from 'cytoscape';
import { rdfTriples2Elements, turtle2Elements } from '../../mapper';
import { useEffect, useState } from 'react';
import cytoscape, { ElementDefinition } from 'cytoscape';
import CytoscapeComponent from 'react-cytoscapejs';
import { RdfIndividual, RdfPatch, RdfSelection, RdfTriple } from '../../models';
import { rdfObjectKey, rdfPredicateKey, rdfSubjectKey } from './cytoscapeDataKeys';
import { NodeType } from '../../models/nodeType';

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
		setElements(elements);
	};

	const initialize = (cy: cytoscape.Core) => {
		cy.on('select', () => {
			onElementsSelected(
				new RdfSelection(
					cy.$('node:selected').map((n) => new RdfIndividual(n.data('id'))),
					cy.$('edge:selected').map((n) => new RdfTriple(n.data(rdfSubjectKey), n.data(rdfPredicateKey), n.data(rdfObjectKey)))
				)
			);
		});

		cy.on('unselect', () => {
			if (cy.$(':selected').length === 0) {
				onElementsSelected(new RdfSelection([], []));
			}
		});
	};

	useEffect(() => {
		prepareCytoscapeElements();
	}, [turtleString]);

	useEffect(() => {
		nullableCy && nullableCy.elements('[!layoutIgnore]').layout(selectedLayout).run();
	}, [nullableCy, elements]);

	const setCytoscapeHandle = (cy: Cytoscape.Core) => {
		if (nullableCy) return; // Already initialized
		initialize(cy);
		setCy(cy);
	};

	const applyPatch = (patch: RdfPatch) => {
		if (!nullableCy) return;
		const cy = nullableCy;
		const newTriples = rdfTriples2Elements(patch.tripleAdditions);

		//Modify existing individuals
		patch.tripleAdditions
			.map((a) => a.rdfSubject)
			.forEach((node) => {
				const oldElement = cy.elements(`[id = "${node}"]`);
				if (oldElement) {
					// If old element exist we want to add new properties
					const newElement = newTriples.find((e) => e.data.id === node)!;

					// Order matters, if property exist on both old and new, new data is used
					const combinedData = Object.assign({}, oldElement.data(), newElement.data);
					oldElement.data(combinedData);
				}
			});

		patch.tripleRemovals.forEach((r) => cy.remove(`edge[source='${r.rdfSubject}'][target='${r.rdfObject}']`));
		patch.individualRemovals.forEach((r) => cy.remove(`node[id='${r.iri}']`));

		cy.add(newTriples);
	};

	useEffect(() => {
		const patch = patches.length > 0 && patches.at(-1);
		patch && applyPatch(patch);
	}, [patches]);

	useEffect(() => {
		if (nullableCy) {
			const els = nullableCy.elements('[!layoutIgnore]');
			console.log('Elements', els);
			els.layout(selectedLayout).run();
		}
	}, [selectedLayout]);

	return (
		<CytoscapeComponent
			elements={elements}
			style={uiConfig?.css ?? defaultUiConfig.css}
			stylesheet={[
				{
					selector: 'node[label]',
					style: {
						label: 'data(label)',
					},
				},
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
						height: '2px',
						width: '2px',
						'background-color': 'red',
						'background-opacity': 0.7,
						'border-width': 0,
						events: 'no',
					},
				},
				{
					selector: '[color]',
					style: {
						'background-color': 'data(color)',
					},
				},
				// {
				// 	selector: 'node:parent',
				// 	style: {
				// 		shape: 'cut-rectangle',
				// 		'padding-bottom': '5%',
				// 		'padding-top': '5%',
				// 		'padding-left': '5%',
				// 		'padding-right': '5%',
				// 	},
				// },
				{
					selector: 'edge',
					style: {
						'curve-style': 'taxi',
						width: '1px',
						color: 'black',
						'line-color': 'black',
						// 'taxi-direction': 'rightward',
						// 'taxi-turn': '50px',
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
