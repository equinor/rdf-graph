import go, { Diagram } from 'gojs';
import { ReactDiagram } from 'gojs-react';
import React, { useEffect, useRef, useState } from 'react';

import { linkTemplateMap } from './link-templates/link-template-map';
import { createDefaultNodeTemplate, createSymbolNodeTemplate, createRectangleNodeTemplate } from './node-templates';
import { applyPatch } from './applyPatch';

import { NodeUiType } from './types';
import { GoGraphLayout, GoGraphLayoutType, GoGraphProps } from './GoGraph.types';
import { GraphSelection, GraphState } from '../../models';

const clickHandler = (e: go.InputEvent, thisObj: go.GraphObject) => {
	// console.log('Node clicked!');
	// console.log({ e });
	// console.log(thisObj);
};

const symbolNodeClickHandler = (e: go.InputEvent, thisObj: go.GraphObject) => {
	// console.log('Symbol Node clicked!');
	// console.log({ e });
	// console.log(thisObj.name);
};

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
		}),
	});

	d.toolManager.rotatingTool.snapAngleMultiple = 45;
	d.toolManager.rotatingTool.snapAngleEpsilon = 22.5;
	d.model.modelData.portSize = 6;

	d.nodeTemplateMap = new go.Map<string, go.Part>().add(NodeUiType.Default, createDefaultNodeTemplate(clickHandler));
	// .add(NodeUiType.Default, createRectangleNodeTemplate(clickHandler))
	// .add(NodeUiType.SvgSymbol, createSymbolNodeTemplate(symbolNodeClickHandler))
	// .add(NodeUiType.RctNode, createRectangleNodeTemplate(clickHandler));

	d.linkTemplateMap = linkTemplateMap;

	// d.addDiagramListener('BackgroundSingleClicked', function (e: go.DiagramEvent) {
	// 	console.log('Background clicked:', e);
	// });

	d.layout = new go.ForceDirectedLayout();
	console.log(2);
	return d;
}

function getGraphSelectionDiagramEvent(e: go.DiagramEvent, graphState: GraphState): GraphSelection {
	const selectedNodes = (e.subject as go.Set<go.Part>).filter((f) => {
		return f instanceof go.Node;
	}) as go.Set<go.Node>;

	const selectedLinks = (e.subject as go.Set<go.Part>).filter((f) => {
		return f instanceof go.Link;
	});

	if (selectedNodes.size + selectedLinks.size === 0) return [];

	const selectedPayload: GraphSelection = [];
	const nodesIt = selectedNodes.iterator;

	while (nodesIt.next()) {
		const node = graphState.nodeIndex.get(nodesIt.value.data.id);
		if (!node) continue;
		selectedPayload.push(node);
	}

	return selectedPayload;
}

function getLayout(layout: GoGraphLayout) {
	switch (layout.type) {
		case GoGraphLayoutType.ForceDirectedLayout:
			return new go.ForceDirectedLayout();
		case GoGraphLayoutType.LayeredDigraphLayout:
			return new go.LayeredDigraphLayout();
		default:
			return new go.ForceDirectedLayout();
	}
}

export const GoGraph = (props: GoGraphProps) => {
	const [isDarkMode, setDarkMode] = useState(false);
	const diagramRef = useRef<Diagram>(initDiagram());
	const nodeDataArrayRef = useRef<go.ObjectData[]>([]);
	const linkDataArrayRef = useRef<go.ObjectData[]>([]);

	useEffect(() => {
		const { model } = diagramRef.current;
		model.setDataProperty(model.modelData, 'strokeColor', isDarkMode ? '#fff' : '#000');
		model.setDataProperty(model.modelData, 'nodeColor', isDarkMode ? '#fff' : 'lightgreen');
	}, [isDarkMode]);

	useEffect(() => {
		//uiNegotiator.current.applyPatch(graphPatch);
		applyPatch(diagramRef.current, props.graphPatch);
	}, [props.graphPatch]);

	useEffect(() => {
		diagramRef.current.addDiagramListener('ChangedSelection', handleChangedSelection);
		return () => {
			diagramRef.current.removeDiagramListener('ChangedSelection', handleChangedSelection);
		};
	}, []);

	const handleChangedSelection = (e: go.DiagramEvent) => {
		const selection = getGraphSelectionDiagramEvent(e, props.graphState);
		props.onElementsSelected && props.onElementsSelected(selection);
	};

	useEffect(() => {
		if (!props.options?.layout) return;
		diagramRef.current.layout = getLayout(props.options.layout);
	}, [props.options?.layout]);

	const handleModelChange = (e: go.IncrementalData) => {
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
					background: isDarkMode ? '#424242' : '#fff',
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
