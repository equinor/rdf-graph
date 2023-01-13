import { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';

import { GraphPatch, GraphState } from 'core/types/core';
import { RdfGraphProps } from 'core/types/ui';
import { applyPatch } from './applyPatch';
import { patchGraphState } from '../core/patch';
import { layoutDagre } from './layout';
import { imageHeightKey, imageWidthKey, NodeType } from './common';

const defaultDiagramStyle: React.CSSProperties = {
	height: '100vh',
	width: '100%',
	overflow: 'hidden',
};

export type RdfCyGraphProps = RdfGraphProps<cytoscape.EventObject> & {
	onCyInit?: (cy: cytoscape.Core) => void;
};

const layoutHandler = (_event: cytoscape.EventObject) => {
	const connectorSelector = `[nodeType = "${NodeType.SymbolConnector}"]`;
	const imageSelector = `[nodeType = "${NodeType.SymbolImage}"]`;

	_event.cy
		.$(`${connectorSelector}, ${imageSelector}`)
		.layout({
			name: 'preset',
			animate: false,
			transform: (node) => {
				const parentPosition = node.parent().first().position();
				const parentSize = node.parent().first().data(imageWidthKey);
				console.log("PAREN width ",	 parentSize);
				const relativePosition = node.data('connectorRelativePosition') || {
					x: 0,
					y: 0,
				};
				console.log("REL POS = ", relativePosition);
				console.log("Parent POS = ", parentPosition);
				const position = {
					x: parentPosition.x + relativePosition.x,
					y: parentPosition.y + relativePosition.y,
				};
				return position;
			},
		})
		.run();
};

export const RdfCyGraph = ({
	style,
	customGraphPatches,
	rdfPatches,
	symbolProvider,
	onGraphStateChanged,
	onGraphSelectionChanged,
	onSelectionChanged,
	onCyInit,
}: RdfCyGraphProps) => {
	const selectedLayout = layoutDagre;

	const divRef = useRef<HTMLDivElement>(null);

	const cyRef = useRef<cytoscape.Core>();
	const [initialized, setInitialized] = useState(false);

	const [graphState, setGraphState] = useState<GraphState>({
		nodeStore: {},
		predicateNodeStore: {},
		edgeStore: {},
	});

	useEffect(() => {
		loadCy();
		setInitialized(true);
	}, []);

	useEffect(() => {
		if (!initialized) return;

		console.log('RdfPatches:', rdfPatches);

		const patchGraphResult = patchGraphState(graphState, rdfPatches, { symbolProvider });

		setGraphState(patchGraphResult.graphState);

		if (onGraphStateChanged) {
			onGraphStateChanged({ ...patchGraphResult.graphState });
		}

		applyPatches(patchGraphResult.graphPatches);

	}, [rdfPatches]);

	useEffect(() => {
		if (!initialized) return;
		applyPatches(customGraphPatches);
	}, [customGraphPatches]);

	const applyPatches = (patches: GraphPatch[]) => {
		if (cyRef.current === undefined) return;
		applyPatch(patches, cyRef.current);
		runLayout(cyRef.current);
	};

	const runLayout = (cy: cytoscape.Core) => {
		const layout = cy.layout(selectedLayout);
		layout.on('layoutstop', layoutHandler);
		layout.run();
	};

	const loadCy = () => {
		const cy = cytoscape({
			container: divRef.current,
			elements: [],
			style: [
				{
					selector: `[nodeType = "SymbolContainer"]`,
					style: {
						shape: 'rectangle',
						'background-color': 'red',
						'background-opacity': 0,
						'border-width': 0,
					},
				},
				{
					selector: `[nodeType = "SymbolImage"]`,
					style: {
						shape: 'rectangle',
						'background-clip': 'none',
						'background-fit': 'contain',
						'background-image': `data(image)`,
						width: `data(${imageWidthKey})`,
						height: `data(${imageHeightKey})`,
						'border-width': 0,
						'padding-bottom': '0px',
						events: 'no',
					},
				},
				{
					selector: `[nodeType = "SymbolConnector"]`,
					style: {
						shape: 'rectangle',
						// height: state.uiConfig.showConnectors ? '8px' : '1px',
						// width: state.uiConfig.showConnectors ? '8px' : '1px',
						height: '8px',
						width: '8px',
						'background-color': 'red',
						// 'background-opacity': state.uiConfig.showConnectors ? 0.7 : 0.0,
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
					selector: `[fill]`,
					style: {
						'background-color': `data(fill)`,
					},
				},
				{
					selector: `[label][nodeType != "SymbolConnector"]`,
					style: {
						color: '#ccc',
						label: `data(label)`,
						'text-valign': 'bottom',
						'text-halign': 'center',
						'text-wrap': 'wrap',
						'text-max-width': '150px',
					},
				},
				{
					selector: `[simpleSvg]`,
					style: {
						'background-clip': 'none',
						'background-fit': 'contain',
						'background-opacity': 0,
						'border-width': 0,
						'padding-bottom': '0px',
						'background-image': `data(simpleSvgKey)`,
					},
				},
				{
					selector: 'edge',
					style: {
						// 'curve-style': state.uiConfig.edgeStyle,
						'curve-style': 'bezier',
						width: '1px',
						'target-arrow-color': '#ccc',
						'target-arrow-fill': 'filled',
						'target-arrow-shape': 'chevron',
						'arrow-scale': 1.5,
					},
				},
				{
					selector: `edge[stroke]`,
					style: {
						'line-color': `data(stroke)`,
					},
				},
			],
		}).on('select', (ev) => {
			if (!onGraphSelectionChanged) return;
			const selectedNodes = cyRef.current?.$('node:selected').map((n) => n.data().id);
			onGraphSelectionChanged({ nodes: selectedNodes ?? [], edges: [] });
			if (onSelectionChanged) onSelectionChanged(ev);
		});

		if (onCyInit) onCyInit(cy);
		cyRef.current = cy;

		setInitialized(true);
	};

	return <div ref={divRef} style={{ ...defaultDiagramStyle, ...style }}></div>;
};
