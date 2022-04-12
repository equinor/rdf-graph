import { LayoutWrapper, SparqlGraphProps, UiConfigProps } from './SparqlGraph.types';
import { layoutCola, layoutCoseBilKent, layoutDagre } from '../../utils';
import Cytoscape from 'cytoscape';
import { useTurtleHelpers } from '../../mapper';
import { useEffect, useState } from 'react';
import { useCytoscapeHelpers } from '../../hooks';
import { ElementDefinition } from 'cytoscape';
import CytoscapeComponent from 'react-cytoscapejs';
import { RdfIndividual, RdfSelection, RdfTriple } from '../../models';
import { rdfObjectKey, rdfPredicateKey, rdfSubjectKey } from './cytoscapeDataKeys';

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

export const SparqlGraph = ({ turtleString, layoutName, uiConfig, onElementsSelected }: SparqlGraphProps) => {
	const selectedLayout = layouts.find((lt) => lt.name === layoutName)!.layout;
	const [turtle2Edges] = useTurtleHelpers();
	const [elements, setElements] = useState<ElementDefinition[]>([]);
	const [getCytoscapeElementsByEdges] = useCytoscapeHelpers();
	const [cy, setCy] = useState<cytoscape.Core>();

	const prepareCytoscapeElements = async () => {
		const edges = await turtle2Edges(turtleString);
		const elements = getCytoscapeElementsByEdges(edges);
		setElements(elements);
	};

	useEffect(() => {
		cy &&
			cy.on('select', () => {
				onElementsSelected(
					new RdfSelection(
						cy.$('node:selected').map((n) => new RdfIndividual(n.data('id'))),
						cy.$('edge:selected').map((n) => new RdfTriple(n.data(rdfSubjectKey), n.data(rdfPredicateKey), n.data(rdfObjectKey)))
					)
				);
			});
		// TODO: update on onElementsSelected callback change?
	}, [cy]);

	useEffect(() => {
		prepareCytoscapeElements();
	}, [turtleString]);

	useEffect(() => {
		cy && cy.layout(selectedLayout).run();
	}, [cy, elements]);

	const setCytoscapeHandle = (ct: Cytoscape.Core) => {
		if (cy) return;
		setCy(ct);
	};

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
