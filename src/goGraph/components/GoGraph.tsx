import go, { Diagram } from 'gojs';
import { ReactDiagram } from 'gojs-react';
import React, { FC, useEffect, useRef, useState } from 'react';

import { linkTemplateMap } from '../link-templates/link-template-map';
import { createDefaultNodeTemplate, createEdgeConnectorNodeTemplate, createSymbolNodeTemplate } from '../node-templates';

import { NodeUiCategory } from '../types';
import { getDefaultLayoutConfig, getLayout, GoGraphLayout } from '../layout';
import { GraphSelection, GraphState } from '../../core/types';
import { getUiTheme } from '../style/colors';
import { GoGraphProps } from '../types/component.types';
import { GoJsPatchHandler } from '../uiPatchHandler';
import { applyPatch, IUiPatchHandler } from '../../core/ui/applyPatch';

const clickHandler = (_e: go.InputEvent, _thisObj: go.GraphObject) => {};

const symbolNodeClickHandler = (_e: go.InputEvent, _thisObj: go.GraphObject) => {};

function initDiagram() {
	const $ = go.GraphObject.make;
	const d = $(go.Diagram, {
		initialAutoScale: go.Diagram.Uniform,
		initialContentAlignment: go.Spot.Center,
		'undoManager.isEnabled': true,
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
	d.model.modelData.portSize = 3;
	d.model.modelData.portOpacity = 0.0;

	d.nodeTemplateMap = new go.Map<string, go.Part>()
		.add(NodeUiCategory.Default, createDefaultNodeTemplate(clickHandler))
		.add(NodeUiCategory.SvgSymbol, createSymbolNodeTemplate(symbolNodeClickHandler))
		.add(NodeUiCategory.EdgeConnectorNode, createEdgeConnectorNodeTemplate(clickHandler));

	d.linkTemplateMap = linkTemplateMap;

	d.initialContentAlignment = go.Spot.Center;

	d.layout = getLayout(getDefaultLayoutConfig(GoGraphLayout.ForceDirected));

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

export const GoGraph: FC<GoGraphProps> = (props) => {
	const [isPortDirection, setPortDirection] = useState(props.options?.layout?.type === GoGraphLayout.LayeredDigraph);
	const [isDarkMode, setDarkMode] = useState(false);
	const [diagramStyle, setDiagramStyle] = useState<React.CSSProperties>(() => {
		return {
			height: '100vh',
			width: '100%',
			border: '1px solid lightgrey',
			overflow: 'hidden',
			background: getUiTheme(isDarkMode).canvas.background,
			transition: 'background 0.1s ease',
		};
	});

	const diagramRef = useRef<Diagram>(initDiagram());
	const nodeDataArrayRef = useRef<go.ObjectData[]>([]);
	const linkDataArrayRef = useRef<go.ObjectData[]>([]);

	const patchHandlerRef = useRef<IUiPatchHandler>(new GoJsPatchHandler(diagramRef.current));

	useEffect(() => {
		const { model } = diagramRef.current;
		model.setDataProperty(model.modelData, 'uiTheme', getUiTheme(isDarkMode));
		setDiagramStyle({ ...diagramStyle, background: getUiTheme(isDarkMode).canvas.background });
	}, [isDarkMode]);

	useEffect(() => {
		let visible = false;
		if (props.options?.showSymbolPorts) visible = props.options?.showSymbolPorts;
		const { model } = diagramRef.current;
		model.setDataProperty(model.modelData, 'portOpacity', visible ? 1 : 0);
	}, [props.options?.showSymbolPorts]);

	useEffect(() => {
		applyPatch(props.graphPatch, patchHandlerRef.current);
	}, [props.graphPatch]);

	useEffect(() => {
		const { model } = diagramRef.current;
		model.set(model.modelData, 'setPortDirection', isPortDirection);
	}, [isPortDirection]);

	useEffect(() => {
		diagramRef.current.addDiagramListener('ChangedSelection', handleChangedSelection);
		return () => {
			diagramRef.current.removeDiagramListener('ChangedSelection', handleChangedSelection);
		};
	}, []);

	const handleChangedSelection = (e: go.DiagramEvent) => {
		if (!props.selectionEffect) return;
		const selection = getGraphSelection(e, props.graphState);
		applyPatch(props.selectionEffect(selection), patchHandlerRef.current);
	};

	useEffect(() => {
		const layout = props.options?.layout;
		if (!layout) return;

		switch (layout.type) {
			case GoGraphLayout.ForceDirected:
				setPortDirection(false);
				break;
			case GoGraphLayout.LayeredDigraph:
				setPortDirection(true);
				break;
			default:
				break;
		}

		diagramRef.current.layout = getLayout(layout);
	}, [props.options?.layout]);

	const handleModelChange = (_e: go.IncrementalData) => {};

	useEffect(() => {
		const style = props.options?.containerStyle;
		if (!style) return;
		setDiagramStyle({ ...diagramStyle, ...style });
	}, [props.options?.containerStyle]);

	useEffect(() => {
		const theme = props.options?.theme;
		if (!theme) return;
		setDarkMode(theme === 'dark');
	}, [props.options?.theme]);

	// Hacky solution to center diagram. Need to find other solution for this...
	useEffect(() => {
		setTimeout(function () {
			diagramRef.current.alignDocument(go.Spot.Center, go.Spot.Center);
		}, 10);
	}, []);

	return (
		<>
			<ReactDiagram
				style={diagramStyle}
				initDiagram={() => diagramRef.current}
				divClassName="graph-links-model"
				nodeDataArray={nodeDataArrayRef.current}
				linkDataArray={linkDataArrayRef.current}
				onModelChange={handleModelChange}
			/>
		</>
	);
};
