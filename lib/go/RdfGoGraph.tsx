import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as go from 'gojs';
import { GraphState } from 'core/types/core';

import { applyPatch } from './applyPatch';
import { patchGraphState } from '../core/patch';
import { GraphSelection, RdfGraphProps } from 'core/types/ui';

const defaultDiagramStyle: React.CSSProperties = {
	height: '100vh',
	width: '100%',
	overflow: 'hidden',
};

export type RdfGoGraphProps = RdfGraphProps<go.DiagramEvent> & {
	initDiagram: () => go.Diagram;
};

export type RdfGoGraphDiagramRef = {
	getDiagram(): go.Diagram | null;
	getGraphState(): GraphState;
};

export type RdfGoGraphState = {
	connectorNodes: Record<string, { symbolNodeId?: string; portId?: string }>;
};

//const goState: RdfGoGraphState = { connectorNodes: {} };

const RdfGoGraph = forwardRef(
	(
		{
			initDiagram,
			style,
			rdfPatches,
			customGraphPatches,
			symbolProvider,
			onGraphStateChanged,
			onGraphSelectionChanged,
			onSelectionChanged,
		}: RdfGoGraphProps,
		ref: React.ForwardedRef<RdfGoGraphDiagramRef>
	) => {
		const divElRef = useRef<HTMLDivElement>(null);
		const goState = useRef<RdfGoGraphState>({ connectorNodes: {} });
		const [initialized, setInitialized] = useState(false);
		const [graphState, setGraphState] = useState<GraphState>({
			nodeStore: {},
			predicateNodeStore: {},
			edgeStore: {},
		});

		useImperativeHandle(
			ref,
			() => {
				return {
					getDiagram() {
						return divElRef.current ? go.Diagram.fromDiv(divElRef.current) : null;
					},
					getGraphState() {
						return graphState;
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
			console.info('INIT RdfGraphDiagram');
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
			console.log('RdfPatches:', rdfPatches);
			const patchGraphResult = patchGraphState(graphState, rdfPatches, { symbolProvider });

			setGraphState(patchGraphResult.graphState);

			if (onGraphStateChanged) {
				onGraphStateChanged({ ...patchGraphResult.graphState });
			}

			const diagram = getDiagram();
			if (!diagram) return;
			applyPatch(patchGraphResult.graphPatches, diagram, goState.current);

			console.log('GraphPatches:', patchGraphResult.graphPatches);
		}, [rdfPatches]);

		useEffect(() => {
			if (!initialized) return;
			console.log('Custom graphPatches:', customGraphPatches);
			const diagram = getDiagram();
			if (!diagram) return;
			applyPatch(customGraphPatches, diagram, goState.current);
		}, [customGraphPatches]);

		return <div ref={divElRef} style={style ?? defaultDiagramStyle}></div>;
	}
);

RdfGoGraph.displayName = 'RdfGoGraph';
export { RdfGoGraph };
