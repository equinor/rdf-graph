import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as go from 'gojs';
import { GraphState, RdfPatch, SymbolProvider } from 'core/types/types';
import { patchGraphState } from 'core/patch';
import { applyPatch } from './applyPatch';
import { RdfGraphError } from 'core/types/RdfGraphError';

const defaultDiagramStyle: React.CSSProperties = {
	height: '100vh',
	width: '100%',
	overflow: 'hidden',
};

export type RdfGraphDiagramProps = {
	initDiagram: () => go.Diagram;
	style?: React.CSSProperties;
	rdfPatches: RdfPatch[];
	symbolProvider?: SymbolProvider;
	// selectionEffect?: SelectionCallback;
	onErrorCallback?: (error: RdfGraphError) => void;
};

export type RdfGraphDiagramRef = {
	getDiagram(): go.Diagram | null;
};

const RdfGraphDiagram = forwardRef(
	(
		{ initDiagram, style, rdfPatches, symbolProvider }: RdfGraphDiagramProps,
		ref: React.ForwardedRef<RdfGraphDiagramRef>
	) => {
		const divElRef = useRef<HTMLDivElement>(null);
		const [initialized, setInitialized] = useState(false);
		const [graphState, setGraphState] = useState<GraphState>();

		useImperativeHandle(
			ref,
			() => {
				return {
					getDiagram() {
						return divElRef.current ? go.Diagram.fromDiv(divElRef.current) : null;
					},
				} as RdfGraphDiagramRef;
			},
			[]
		);

		const getDiagram = () => {
			return divElRef.current ? go.Diagram.fromDiv(divElRef.current) : null;
		};

		// const changedSelectionHandler = (e: go.DiagramEvent) => {
		// 	if (!selectionEffect || !patchHandlerRef.current) return;
		// 	const undo: PropertyAssertion[] = prevSelectionEffect.current.map(
		// 		({ action, assertion }) => ({
		// 			action: action === 'add' ? 'remove' : 'add',
		// 			assertion,
		// 		})
		// 	);

		// 	const selection = getGraphSelection(e, graphState.graphState);
		// 	const selectionPatch = selectionEffect(selection);
		// 	prevSelectionEffect.current = selectionPatch;
		// 	applyPatch(undo.concat(selectionPatch), patchHandlerRef.current);
		// };

		useEffect(() => {
			console.info('INIT RdfGraphDiagram');
			const diagram = initDiagram();
			diagram.div = divElRef.current;
			// diagram.addDiagramListener('ChangedSelection', changedSelectionHandler);
			setInitialized(true);
			return () => {
				diagram.div = null;
				// diagram.removeDiagramListener('ChangedSelection', changedSelectionHandler);
			};
		}, []);

		useEffect(() => {
			if (!initialized || !graphState) return;

			const patchGraphResult = patchGraphState(graphState, rdfPatches, { symbolProvider });

			setGraphState(patchGraphResult.graphState);

			const diagram = getDiagram();
			if (!diagram) return;
			applyPatch(patchGraphResult.graphPatches, diagram);
		}, [rdfPatches]);

		return <div ref={divElRef} style={style ?? defaultDiagramStyle}></div>;
	}
);

RdfGraphDiagram.displayName = 'RdfGraphDiagram';
export { RdfGraphDiagram };
