import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as go from 'gojs';
import { GraphState, RdfPatch, SymbolProvider } from 'core/types/core';

import { applyPatch } from './applyPatch';
import { RdfGraphError } from '../core/types/RdfGraphError';
import { patchGraphState } from '../core/patch';

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
	initDiagram: () => go.Diagram;
	style?: React.CSSProperties;
	rdfPatches: RdfPatch[];
	symbolProvider?: SymbolProvider;
	onErrorCallback?: (error: RdfGraphError) => void;
	onGraphStateChanged?: (state: GraphState) => void;
	onGraphSelectionChanged?: (selection: GraphSelection) => void;
	onSelectionChanged?: (e: go.DiagramEvent) => void;
};

export type RdfGraphDiagramRef = {
	getDiagram(): go.Diagram | null;
	getGraphState(): GraphState;
};

const RdfGraphDiagram = forwardRef(
	(
		{
			initDiagram,
			style,
			rdfPatches,
			symbolProvider,
			onGraphStateChanged,
			onGraphSelectionChanged,
			onSelectionChanged,
		}: RdfGraphDiagramProps,
		ref: React.ForwardedRef<RdfGraphDiagramRef>
	) => {
		const divElRef = useRef<HTMLDivElement>(null);
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
				} as RdfGraphDiagramRef;
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
			applyPatch(patchGraphResult.graphPatches, diagram);

			console.log('GraphPatches:', patchGraphResult.graphPatches);
		}, [rdfPatches]);

		return <div ref={divElRef} style={style ?? defaultDiagramStyle}></div>;
	}
);

RdfGraphDiagram.displayName = 'RdfGraphDiagram';
export { RdfGraphDiagram };
