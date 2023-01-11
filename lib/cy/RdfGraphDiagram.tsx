import { useEffect, useRef, useState } from 'react';
import Cytoscape from 'cytoscape';
import { GraphPatch, GraphState, RdfPatch } from 'core/types/core';

import { applyPatch } from './applyPatch';
import { RdfGraphError } from '../core/types/RdfGraphError';
import { patchGraphState } from '../core/patch';
import { layoutDagre } from './layout';
import { UiSymbolProvider } from 'core/types/UiSymbol';
import cytoscape from 'cytoscape';

const defaultDiagramStyle: React.CSSProperties = {
	height: '100vh',
	width: '100%',
	overflow: 'hidden',
};

export type GraphSelection = {
	nodes: string[];
	edges: string[];
};

export type RdfGraphDiagramProps = {
	style?: React.CSSProperties;
	rdfPatches: RdfPatch[];
	symbolProvider?: UiSymbolProvider;
	onErrorCallback?: (error: RdfGraphError) => void;
	onGraphStateChanged?: (state: GraphState) => void;
	onGraphSelectionChanged?: (selection: GraphSelection) => void;
	//onSelectionChanged?: (e: go.DiagramEvent) => void;
};

export type RdfGraphDiagramRef = {
	getDiagram(): go.Diagram | null;
	getGraphState(): GraphState;
};

export const RdfGraphDiagram = ({
	style,
	rdfPatches,
	symbolProvider,
	onGraphStateChanged,
	onGraphSelectionChanged,
}: RdfGraphDiagramProps) => {
	const selectedLayout = layoutDagre;

	const divRef = useRef<HTMLDivElement>(null);

	const cyRef = useRef<Cytoscape.Core>();
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

		console.log('GraphPatches:', patchGraphResult.graphPatches);
	}, [rdfPatches]);

	const applyPatches = (patches: GraphPatch[]) => {
		if (cyRef.current === undefined) return;
		applyPatch(patches, cyRef.current);
		runLayout(cyRef.current);
	};

	const runLayout = (cy: cytoscape.Core) => {
		const layout = cy.layout(selectedLayout);
		layout.on('layoutstop', () => {}); // TODO: must implement to get symbols to work...
		layout.run();
	};

	const loadCy = () => {
		cyRef.current = cytoscape({
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
						width: `data(imageWidth)`,
						height: `data(imageHeight)`,
						'background-color': 'blue',
						'background-opacity': 0.15,
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
					selector: `[label]`,
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
		}).on('select', () => {
			if (!onGraphSelectionChanged) return;
			const selectedNodes = cyRef.current?.$('node:selected').map((n) => n.data().id);
			onGraphSelectionChanged({ nodes: selectedNodes ?? [], edges: [] });
		});

		setInitialized(true);
	};

	return <div ref={divRef} style={{ ...defaultDiagramStyle, ...style }}></div>;
};
