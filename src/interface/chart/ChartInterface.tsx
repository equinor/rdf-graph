import { FC, useEffect, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import Cytoscape from 'cytoscape';
import { ElementDefinition } from 'cytoscape';

import { layoutCola, layoutCoseBilKent, layoutDagre } from '../../utils';
import { ChartInterfaceProps, LayoutWrapper } from './ChartInterface.types';
import { useTurtleHelpers } from '../../mapper';

import './ChartInterface.scss';
import { useCytoscapeHelpers } from '../../hooks';

export const ChartInterface: FC<ChartInterfaceProps> = ({ turtleString, layoutName }: ChartInterfaceProps): JSX.Element => {
	const layouts: LayoutWrapper[] = [
		{ name: 'Cose-Bilkent', layout: layoutCoseBilKent },
		{ name: 'Cola', layout: layoutCola },
		{ name: 'Dagre', layout: layoutDagre },
	];

	const selectedLayout = layouts.find((lt) => lt.name === layoutName)!.layout;

	const [turtle2Edges] = useTurtleHelpers();
	const [elements, setElements] = useState<ElementDefinition[]>([]);
	const [getCytoscapeElementsByEdges] = useCytoscapeHelpers();
	const [nullableCy, setCy] = useState<Cytoscape.Core>();

	const prepareCytoscapeElements = async () => {
		const edges = await turtle2Edges(turtleString);
		const elements = getCytoscapeElementsByEdges(edges);
		setElements(elements);
	};

	useEffect(() => {
		prepareCytoscapeElements();
	}, [turtleString]);

	useEffect(() => {
		nullableCy && nullableCy.layout(selectedLayout).run();
	}, [nullableCy, elements]);

	const setCytoscapeHandle = (ct: Cytoscape.Core) => {
		if (nullableCy) return;
		setCy(ct);
	};

	return (
		<div className="ChartInterface__content">
			<CytoscapeComponent
				elements={elements}
				layout={selectedLayout}
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
				cy={(x) => setCytoscapeHandle(x)}
			/>
		</div>
	);
};
