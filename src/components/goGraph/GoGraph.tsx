import go, { Diagram } from 'gojs';
import { ReactDiagram } from 'gojs-react';
import { useEffect, useRef, useState } from 'react';

import { linkTemplateMap } from './link-templates/link-template-map';
import { createDefaultNodeTemplate, createSymbolNodeTemplate } from './node-templates';
import { applyPatch } from './applyPatch';

import { NodeUiCategory } from './types';
import { GraphLayout, GraphLayouts, OptionsGraphProps } from '../../config/Layout';
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
		.add(NodeUiCategory.EdgeConnectorNode, createDefaultNodeTemplate(clickHandler));
	// .add(NodeUiCategory.EdgeConnectorNode, createEdgeConnectorNodeTemplate(clickHandler))

	d.linkTemplateMap = linkTemplateMap;
	// d.addDiagramListener('ChangedSelection', () => {
	// 	// Highlights
	// 	const { nodes, model, selection } = d;

	// 	// Set highlight to 0 for everything before updating
	// 	nodes.each((node: GoGraphNodeHighlightProps) => (node.highlight = 0));

	// 	const sel = selection.first();

	// 	// if (sel === null) return;

	// 	// const nodesConnect = () => {
	// 	// 	if (sel instanceof go.Link) {
	// 	// 		x.toNode.highlight = i;
	// 	// 		x.fromNode.highlight = i;
	// 	// 	} else {
	// 	// 		x.findNodesConnected().each(node => node.highlight = i);
	// 	// 	}
	// 	// };

	// 	const nodesReach = (x: go.Part, i: number) => {
	// 		if (x instanceof go.Link) {
	// 			const toNode: GoGraphNodeHighlightProps | null = x.toNode;
	// 			if (!toNode) return;

	// 			toNode.highlight = i;
	// 			nodesReach(toNode, i + 1);
	// 		} else {
	// 			// TODO: fix types
	// 			// Problem: go.Part type hasnt findNodesOutOf
	// 			// https://github.com/dert261/cucm_axl/blob/master/src/main/resources/static/assets/gojs/1.5.2/goJS.d.ts
	// 			// @ts-ignore:next-line
	// 			x.findNodesOutOf().each((node: GoGraphNodeHighlightProps) => {
	// 				if (node.highlight === 0 || (node.highlight && node.highlight > i)) {
	// 					node.highlight = i;
	// 					nodesReach(node, i + 1);
	// 				}
	// 			});
	// 		}
	// 	};

	// 	// perform the actual highlighting
	// 	const highlight = ({ highlight, data }: GoGraphNodeHighlightProps) => {
	// 		let color: string;

	// 		switch (highlight) {
	// 			case 1:
	// 				color = 'blue';
	// 				break;
	// 			case 2:
	// 				color = 'green';
	// 				break;
	// 			case 3:
	// 				color = 'orange';
	// 				break;
	// 			case 4:
	// 				color = 'red';
	// 				break;
	// 			case 0:
	// 			default:
	// 				color = 'lightgreen';
	// 				break;
	// 		}

	// 		model.commit((m) => m.set(data, 'highlightStrokeColor', color), 'changed node color');
	// 	};

	// 	// => Indicating a closer relationship to the original node.
	// 	if (sel !== null) nodesReach(sel, 1);
	// 	// => Highlight all nodes linked to this one
	// 	// nodesConnect(sel, 1);
	// 	nodes.each((node) => highlight(node));
	// });

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
		const { model, nodes } = diagramRef.current;
		nodes.map(({ data }) => model.commit((m) => m.set(data, 'setPortDirection', isPortDirection), 'Set port direction'));
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
