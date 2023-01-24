import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as go from 'gojs';

import { applyPatch } from './applyPatch';
import { GraphSelection, RdfGraphProps } from '../core/types';

const defaultDiagramStyle: React.CSSProperties = {
	height: '100vh',
	width: '100%',
	overflow: 'hidden',
};

type RdfGoGraphProps = RdfGraphProps<go.DiagramEvent> & {
	initDiagram: () => go.Diagram;
};

export type RdfGoGraphDiagramRef = {
	getDiagram(): go.Diagram | null;
	resetDiagram(): void;
};

export type RdfGoGraphState = {
	connectorNodes: Record<string, { symbolNodeId?: string; portId?: string }>;
};

export const RdfGoGraph = forwardRef<RdfGoGraphDiagramRef, RdfGoGraphProps>(function RdfGoGraph(
	{ graphPatches, initDiagram, onGraphSelectionChanged, onSelectionChanged, style },
	ref
) {
	const divElRef = useRef<HTMLDivElement>(null);
	const goState = useRef<RdfGoGraphState>({ connectorNodes: {} });
	const [initialized, setInitialized] = useState(false);

	useImperativeHandle(
		ref,
		() => {
			return {
				getDiagram() {
					return divElRef.current ? go.Diagram.fromDiv(divElRef.current) : null;
				},
				resetDiagram() {
					goState.current = { connectorNodes: {} };
					if (divElRef.current) go.Diagram.fromDiv(divElRef.current)?.reset();
				},
			} as RdfGoGraphDiagramRef;
		},
		[]
	);

	const getDiagram = () => {
		return divElRef.current ? go.Diagram.fromDiv(divElRef.current) : null;
	};

	const selectionChangedHandler = (e: go.DiagramEvent) => {
		// Forward diagram selection event
		if (onSelectionChanged) onSelectionChanged(e);

		// Generate graph selection and notify
		if (!onGraphSelectionChanged) return;
		const selection = e.diagram.selection.toArray();
		const graphSelection = selection.reduce<GraphSelection>(
			(acc, curr) => {
				if (curr.data.type === 'node') {
					acc.nodes.push(curr.data.id);
				} else if (curr.data.type === 'edge') {
					acc.edges.push(curr.data.id);
				}
				return acc;
			},
			{ nodes: [], edges: [] }
		);

		onGraphSelectionChanged(graphSelection);
	};

	useEffect(() => {
		const diagram = initDiagram();
		diagram.div = divElRef.current;
		diagram.addDiagramListener('ChangedSelection', selectionChangedHandler);
		setInitialized(true);
		return () => {
			diagram.div = null;
			diagram.removeDiagramListener('ChangedSelection', selectionChangedHandler);
		};
	}, []);

	useEffect(() => {
		if (!initialized) return;
		const diagram = getDiagram();
		if (!diagram) return;
		applyPatch(graphPatches, diagram, goState.current);
	}, [graphPatches]);

	return <div ref={divElRef} style={style ?? defaultDiagramStyle}></div>;
});
