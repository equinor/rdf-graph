import go, { Diagram } from 'gojs';
import { ReactDiagram } from 'gojs-react';
import { useEffect, useRef, useState } from 'react';

import { linkTemplateMap } from './link-templates/link-template-map';
import { createDefaultNodeTemplate, createEdgeConnectorNodeTemplate, createSymbolNodeTemplate } from './node-templates';
import { applyPatch } from './applyPatch';

import { NodeUiCategory } from './types';
import { GraphLayout, GraphLayouts, OptionsGraphProps } from '../../config/Layout';
import { GraphSelection, GraphState } from '../../models';
import { getUiTheme } from './style/colors';

const clickHandler = (e: go.InputEvent, thisObj: go.GraphObject) => {};

const symbolNodeClickHandler = (e: go.InputEvent, thisObj: go.GraphObject) => {};

function initDiagram() {
	const $ = go.GraphObject.make;
	// set your license key here before creating the diagram: go.Diagram.licenseKey = "...";
	const d = $(go.Diagram, {
		'undoManager.isEnabled': true,
		// 'undoManager.maxHistoryLength': 0,  // uncomment disable undo/redo functionality
		'clickCreatingTool.archetypeNodeData': {
			text: 'new node',
			color: 'lightblue',
		},
		model: $(go.GraphLinksModel, {
			nodeKeyProperty: 'id',
			linkKeyProperty: 'id',
			linkFromPortIdProperty: 'fromPort',
			linkToPortIdProperty: 'toPort',
			// nodeCategoryProperty: 'category',
		}),
	});

	d.toolManager.rotatingTool.snapAngleMultiple = 45;
	d.toolManager.rotatingTool.snapAngleEpsilon = 22.5;
	d.model.modelData.portSize = 6;

	d.nodeTemplateMap = new go.Map<string, go.Part>()
		.add(NodeUiCategory.Default, createDefaultNodeTemplate(clickHandler))
		.add(NodeUiCategory.SvgSymbol, createSymbolNodeTemplate(symbolNodeClickHandler))
		.add(NodeUiCategory.EdgeConnectorNode, createEdgeConnectorNodeTemplate(clickHandler));
	// .add(NodeUiCategory.EdgeConnectorNode, createEdgeConnectorNodeTemplate(clickHandler))

	d.linkTemplateMap = linkTemplateMap;

	d.layout = new go.ForceDirectedLayout();

	return d;
}

function getGraphSelection(e: go.DiagramEvent, graphState: GraphState): GraphSelection {
	const selectionSet = e.subject as go.Set<go.Part>;
	const selectedPayload: GraphSelection = [];
	const selIt = selectionSet.iterator;

	while (selIt.next()) {
		if (selIt.value instanceof go.Node) {
			const node = graphState.nodeIndex.get(selIt.value.data.id);
			if (!node) continue;
			selectedPayload.push(node);
		}
		if (selIt.value instanceof go.Link) {
			const edge = graphState.linkIndex.get(selIt.value.data.id);
			if (!edge) continue;
			selectedPayload.push(edge);
		}
	}

	return selectedPayload;
}

export const GoGraph = (props: OptionsGraphProps) => {
	const [isPortDirection, setPortDirection] = useState(false);
	const [isDarkMode, setDarkMode] = useState(false);
	const diagramRef = useRef<Diagram>(initDiagram());
	const nodeDataArrayRef = useRef<go.ObjectData[]>([]);
	const linkDataArrayRef = useRef<go.ObjectData[]>([]);

	// SYSTEM COLOR
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	console.log('prefersDark:', prefersDark);

	useEffect(() => {
		const { model } = diagramRef.current;

		model.setDataProperty(model.modelData, 'uiTheme', getUiTheme(isDarkMode));
	}, [isDarkMode]);

	useEffect(() => {
		//uiNegotiator.current.applyPatch(graphPatch);
		applyPatch(diagramRef.current, props.graphPatch);
	}, [props.graphPatch]);

	useEffect(() => {
		const { model } = diagramRef.current;

		model.commit((m) => m.nodeDataArray.map((d) => m.set(d, 'setPortDirection', isPortDirection)));
	}, [isPortDirection]);

	useEffect(() => {
		diagramRef.current.addDiagramListener('ChangedSelection', handleChangedSelection);
		return () => {
			diagramRef.current.removeDiagramListener('ChangedSelection', handleChangedSelection);
		};
	}, []);

	const getLayout = (layout: GraphLayout) => {
		switch (layout.type) {
			case GraphLayouts.ForceDirected:
				setPortDirection(false);

				return new go.ForceDirectedLayout();
			case GraphLayouts.LayeredDigraph:
				setPortDirection(true);

				return new go.LayeredDigraphLayout({
					direction: 90,
					setsPortSpots: false,
					layeringOption: go.LayeredDigraphLayout.LayerLongestPathSink,
					layerSpacing: 100,
				});
			default:
				return new go.ForceDirectedLayout();
		}
	};

	const handleChangedSelection = (e: go.DiagramEvent) => {
		if (!props.selectionEffect) return;
		const selection = getGraphSelection(e, props.graphState);
		applyPatch(diagramRef.current, props.selectionEffect(selection));
	};

	useEffect(() => {
		if (!props.options?.layout) return;

		diagramRef.current.layout = getLayout(props.options.layout);
	}, [props.options?.layout]);

	const handleModelChange = (e: go.IncrementalData) => {
		// console.log(1, e);
		//const { modelData, insertedNodeKeys, modifiedNodeData, removedNodeKeys, insertedLinkKeys, modifiedLinkData, removedLinkKeys } = e;
	};

	return (
		<>
			<button
				style={{ fontSize: '18px', border: 'none', background: 'transparent', cursor: 'pointer' }}
				onClick={() => setDarkMode(!isDarkMode)}>
				{isDarkMode ? '☀️' : '🌙'}
			</button>
			<ReactDiagram
				style={{
					height: 'calc(100vh - 70px)',
					width: '100%',
					border: '1px solid lightgrey',
					overflow: 'hidden',
					background: getUiTheme(isDarkMode).canvas.background,
					transition: 'background 0.2s ease',
				}}
				initDiagram={() => diagramRef.current}
				divClassName="graph-links-model"
				nodeDataArray={nodeDataArrayRef.current}
				linkDataArray={linkDataArrayRef.current}
				onModelChange={handleModelChange}
			/>
		</>
	);
};
