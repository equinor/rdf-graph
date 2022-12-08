import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as go from 'gojs';

//import { Quad, Store } from 'n3';

const defaultDiagramStyle: React.CSSProperties = {
	height: '100vh',
	width: '100%',
	overflow: 'hidden',
};

//export type RdfGraphSymbolProvider = (id: string, rotation?: number) => UiNodeSymbol | undefined;

export type RdfGraphDiagramProps = {
	initDiagram: () => go.Diagram;
	style?: React.CSSProperties;
	// rdfStore: Store<Quad, Quad, Quad, Quad>;
	// rdfPatch: RdfPatch2;
	// selectionEffect?: SelectionCallback;
	// onErrorCallback?: ((error: RdfGraphError) => void) | undefined;
	//symbolProvider?: RdfGraphSymbolProvider;
};

export type RdfGraphDiagramRef = {
	getDiagram(): go.Diagram | null;
};

const RdfGraphDiagram = forwardRef(
	(
		{
			initDiagram,
			style,
		}: // rdfPatch,
		// selectionEffect,
		// onErrorCallback,
		// symbolProvider,
		RdfGraphDiagramProps,
		ref: React.ForwardedRef<RdfGraphDiagramRef>
	) => {
		const divElRef = useRef<HTMLDivElement>(null);
		// const patchHandlerRef = useRef<IUiPatchHandler>();
		// const prevSelectionEffect = useRef<PropertyAssertion[]>([]);
		const [initialized, setInitialized] = useState(false);

		// const [graphState, setGraphState] = useState<GraphStateProps>({
		// 	graphState: {
		// 		nodeIndex: new Map<string, GraphNode>(),
		// 		linkIndex: new Map<string, GraphEdge>(),
		// 	},
		// 	graphPatch: [],
		// });

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
			// patchHandlerRef.current = new GoJsPatchHandler(diagram, onErrorCallback);
			setInitialized(true);
			return () => {
				diagram.div = null;
				// diagram.removeDiagramListener('ChangedSelection', changedSelectionHandler);
			};
		}, []);

		// useEffect(() => {
		// 	if (!initialized) return;
		// 	const patchedGraphState = patchGraph(graphState.graphState, rdfPatch, {
		// 		symbolProvider,
		// 	});
		// 	setGraphState(patchedGraphState);
		// 	if (!patchHandlerRef.current) return;
		// 	applyPatch(patchedGraphState.graphPatch, patchHandlerRef.current);
		// }, [rdfPatch]);

		return <div ref={divElRef} style={style ?? defaultDiagramStyle}></div>;
	}
);

RdfGraphDiagram.displayName = 'RdfGraphDiagram';
export { RdfGraphDiagram };
