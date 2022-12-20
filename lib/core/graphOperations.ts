import { PatchGraphMonad } from './PatchGraphMonad';
import { GraphEdge, GraphNode, KnownProps, PatchGraphResult, PredicateNode } from './types/types';

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

export function addPredicateNode(
	state: PatchGraphResult,
	predicateIri: string,
	edgeId: string
): PatchGraphMonad {
	let predicateNode: PredicateNode;
	if (predicateIri in state.graphState.predicateNodeStore) {
		const pNode = state.graphState.predicateNodeStore[predicateIri];
		predicateNode = {
			...pNode,
			edgeIds: [...pNode.edgeIds, edgeId],
		};
	} else {
		predicateNode = {
			id: predicateIri,
			type: 'node',
			edgeIds: [edgeId],
			variant: 'predicate',
			data: new Map(),
			props: {},
		};
	}

	return new PatchGraphMonad({
		...state,
		graphState: {
			...state.graphState,
			predicateNodeStore: { ...state.graphState.predicateNodeStore, [predicateIri]: predicateNode },
		},
	});
}

export function addEdge(
	state: PatchGraphResult,
	edgeId: string,
	predicateIri: string,
	sourceId: string,
	targetId: string
): PatchGraphMonad {
	const newEdge: GraphEdge = {
		id: edgeId,
		predicateIri: predicateIri,
		type: 'edge',
		sourceId: sourceId,
		targetId: targetId,
	};

	return new PatchGraphMonad({
		...state,
		graphState: {
			...state.graphState,
			edgeStore: { ...state.graphState.edgeStore, [edgeId]: newEdge },
		},
		graphPatches: [...state.graphPatches, { action: 'add', element: newEdge }],
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
