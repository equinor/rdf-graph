import go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import React, { FC, useEffect, useRef, useState } from 'react';
import { GraphSelection, GraphState } from '../../../core/types';
import { GoGraphProps } from '../../types/component.types';
import { GoJsPatchHandler } from '../../uiPatchHandler';
import { applyPatch, IUiPatchHandler } from '../../../core/ui/applyPatch';
import { defaultInitDiagram } from './defaultInit';

export const GoGraph: FC<GoGraphProps> = (props) => {
	const nodeDataArrayRef = useRef<go.ObjectData[]>([]);
	const linkDataArrayRef = useRef<go.ObjectData[]>([]);
	const [diagramStyle, setDiagramStyle] = useState<React.CSSProperties>(getDefaultStyle);

	const initDiagram = () => {
		if (props.diagramInitializer) return props.diagramInitializer();
		return defaultInitDiagram();
	};

	const diagramRef = useRef<go.Diagram>(initDiagram());

	const patchHandlerRef = useRef<IUiPatchHandler>(new GoJsPatchHandler(diagramRef.current));

	useEffect(() => {
		applyPatch(props.graphPatch, patchHandlerRef.current);
	}, [props.graphPatch]);

	useEffect(() => {
		const style = props.containerStyle;
		if (!style) return;
		setDiagramStyle({ ...diagramStyle, ...style });
	}, [props.containerStyle]);

	const changedSelectionHandler = (e: go.DiagramEvent) => {
		if (!props.selectionEffect) return;
		const selection = getGraphSelection(e, props.graphState);
		applyPatch(props.selectionEffect(selection), patchHandlerRef.current);
	};

	useEffect(() => {
		diagramRef.current.addDiagramListener('ChangedSelection', changedSelectionHandler);
		return () => {
			diagramRef.current.removeDiagramListener('ChangedSelection', changedSelectionHandler);
		};
	}, []);

	return (
		<ReactDiagram
			style={diagramStyle}
			initDiagram={() => diagramRef.current}
			divClassName="rdfGoGraphContainer"
			nodeDataArray={nodeDataArrayRef.current}
			linkDataArray={linkDataArrayRef.current}
			onModelChange={props.onModelChange}
		/>
	);
};

function getDefaultStyle(): React.CSSProperties {
	return {
		height: '100vh',
		width: '100%',
		overflow: 'hidden',
	};
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
