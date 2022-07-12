import go, { Diagram } from 'gojs';
import { ReactDiagram } from 'gojs-react';
import React, { useEffect, useRef, useState } from 'react';

import { linkTemplateMap } from './link-templates/link-template-map';
import { createDefaultNodeTemplate, createSymbolNodeTemplate, createEdgeConnectorNodeTemplate } from './node-templates';
import { applyPatch } from './applyPatch';

import { NodeUiCategory } from './types';
import { GoGraphLayout, GoGraphLayoutType, GoGraphProps } from './GoGraph.types';
import { GraphSelection, GraphState } from '../../models';
import { getUiTheme } from './style/colors';

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

	d.nodeTemplateMap = new go.Map<string, go.Part>()
		.add(NodeUiCategory.Default, createDefaultNodeTemplate(clickHandler))
		.add(NodeUiCategory.SvgSymbol, createSymbolNodeTemplate(symbolNodeClickHandler))
		.add(NodeUiCategory.EdgeConnectorNode, createEdgeConnectorNodeTemplate(clickHandler));

	d.linkTemplateMap = linkTemplateMap;

	d.addDiagramListener('ChangedSelection', function (e: go.DiagramEvent) {
		// Highlights
		const { nodes, model } = d;

		// Set highlight to 0 for everything before updating
		nodes.each((node) => (node.highlight = 0));

		const sel = d.selection.first();

		// if (sel === null) return;

		// const nodesConnect = () => {
		// 	if (sel instanceof go.Link) {
		// 		x.toNode.highlight = i;
		// 		x.fromNode.highlight = i;
		// 	} else {
		// 		x.findNodesConnected().each(node => node.highlight = i);
		// 	}
		// };

		const nodesReach = (x: go.Part | null, i: number) => {
			if (x instanceof go.Link) {
				x.toNode.highlight = i;
				nodesReach(x.toNode, i + 1);
			} else {
				x.findNodesOutOf().each((node: go.Part) => {
					if (node.highlight === 0 || node.highlight > i) {
						node.highlight = i;
						nodesReach(node, i + 1);
					}
				});
			}
		};

		// perform the actual highlighting
		const highlight = ({ highlight, data }: go.Node) => {
			let color: string;

			switch (highlight) {
				case 1:
					color = 'blue';
					break;
				case 2:
					color = 'green';
					break;
				case 3:
					color = 'orange';
					break;
				case 4:
					color = 'red';
					break;
				case 0:
				default:
					color = 'lightgreen';
					break;
			}

			model.commit((m) => m.set(data, 'highlightStrokeColor', color), 'changed node color');
		};

		// => Indicating a closer relationship to the original node.
		if (sel !== null) nodesReach(sel, 1);
		// => Highlight all nodes linked to this one
		// nodesConnect(sel, 1);
		nodes.each((node) => highlight(node));
	});

	d.layout = new go.ForceDirectedLayout();

	return d;
}

function getGraphSelection(e: go.DiagramEvent, graphState: GraphState): GraphSelection {
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

	// SYSTEM COLOR
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	console.log('prefersDark:', prefersDark);

	useEffect(() => {
		const { model } = diagramRef.current;
		model.setDataProperty(model.modelData, 'strokeColor', isDarkMode ? '#fff' : '#000');
		model.setDataProperty(model.modelData, 'nodeColor', isDarkMode ? '#fff' : 'lightgreen');
		model.setDataProperty(model.modelData, 'uiTheme', getUiTheme(isDarkMode));
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
		const selection = getGraphSelection(e, props.graphState);
		props.onElementsSelected && props.onElementsSelected(selection);
	};

	useEffect(() => {
		if (!props.options?.layout) return;
		diagramRef.current.layout = getLayout(props.options.layout);
	}, [props.options?.layout]);

	const handleModelChange = (e: go.IncrementalData) => {
		console.log(1);
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
					background: isDarkMode ? '#262626' : '#fafaf9',
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
