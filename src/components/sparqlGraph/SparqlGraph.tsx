import { LayoutWrapper, SparqlGraphProps, UiConfigProps } from './SparqlGraph.types';
import { layoutCola, layoutCoseBilKent, layoutDagre } from '../../utils';
import Cytoscape from 'cytoscape';
import { rdfTriples2Elements, turtle2Elements } from '../../mapper';
import { useEffect, useState } from 'react';
import cytoscape, { ElementDefinition } from 'cytoscape';
import CytoscapeComponent from 'react-cytoscapejs';
import { RdfIndividual, RdfPatch, RdfSelection, RdfTriple } from '../../models';
import { rdfObjectKey, rdfPredicateKey, rdfSubjectKey } from './cytoscapeDataKeys';

import { Button } from '@equinor/eds-core-react';

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
		nullableCy && nullableCy.layout(selectedLayout).run();
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

	return (
		<CytoscapeComponent
			elements={elements}
			layout={selectedLayout}
			style={uiConfig?.css ?? defaultUiConfig.css}
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
			maxZoom={uiConfig?.maxZoom ?? defaultUiConfig.maxZoom}
			minZoom={uiConfig?.minZoom ?? defaultUiConfig.minZoom}
			zoom={uiConfig?.zoom ?? defaultUiConfig.zoom}
			zoomingEnabled={uiConfig?.zoomingEnabled ?? defaultUiConfig.zoomingEnabled}
			cy={(x) => setCytoscapeHandle(x)}
		/>
	);
};
