import { PatchGraphMonad } from './PatchGraphMonad';
import { GraphNode, KnownProps, PatchGraphResult } from './types/types';

export function addNode(state: PatchGraphResult, iri: string): PatchGraphMonad {
	const newNode: GraphNode = {
		id: iri,
		type: 'node',
		variant: 'default',
		data: new Map(),
		props: {},
	};

	return new PatchGraphMonad({
		...state,
		graphState: {
			...state.graphState,
			nodeStore: { ...state.graphState.nodeStore, [iri]: newNode },
		},
		graphPatches: [...state.graphPatches, { action: 'add', element: newNode }],
	});
}

export function putKnownProp<P extends keyof KnownProps>(
	monad: PatchGraphMonad,
	nodeIri: string,
	prop: P,
	propValue: KnownProps[P]
): PatchGraphMonad {
	const state = monad.getState();
	const store = state.graphState.nodeStore;

	if (nodeIri in store) {
		const node = store[nodeIri];
		return new PatchGraphMonad({
			...state,
			graphState: {
				...state.graphState,
				nodeStore: updateNodeInStore(store, { props: { ...node.props, [prop]: propValue } }),
			},
			// TODO handle different value types (for example string[] for has connector)
			graphPatches: [
				...state.graphPatches,
				{ action: 'add', element: { type: 'property', target: node, key: prop, value: propValue } },
			],
		});
	}
	return monad;
}

function updateNodeInStore(
	store: Record<string, GraphNode>,
	toBeUpdated: Partial<GraphNode>
): Record<string, GraphNode> {
	const id = toBeUpdated.id;
	if (!id) {
		console.warn('Missing id in graphOperation update node');
		return store;
	}
	if (id in store) {
		const node = store[id];
		return { ...store, [id]: { ...node, ...toBeUpdated } as GraphNode };
	} else {
		return { ...store, [id]: toBeUpdated as GraphNode };
	}
}
