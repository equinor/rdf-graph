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
				nodeStore: updateNodeInStore(store, nodeIri, {
					props: { ...node.props, [prop]: propValue },
				}),
			},
			// TODO handle different value types (for example string[] for hasConnector)
			graphPatches: [
				...state.graphPatches,
				{ action: 'add', element: { type: 'property', target: node, key: prop, value: propValue } },
			],
		});
	}
	return monad;
}

export function putDataProp(
	monad: PatchGraphMonad,
	nodeIri: string,
	dataKey: string,
	dataValue: string
): PatchGraphMonad {
	const state = monad.getState();
	const store = state.graphState.nodeStore;

	if (nodeIri in store) {
		const node = store[nodeIri];
		return new PatchGraphMonad({
			...state,
			graphState: {
				...state.graphState,
				nodeStore: updateNodeInStore(store, nodeIri, {
					data: { ...node.data, [dataKey]: dataValue },
				}),
			},
			graphPatches: [
				...state.graphPatches,

				// TODO handle multiple object for each (subject, predicate)-pair
				{
					action: 'add',
					element: { type: 'data', target: node, key: dataKey, values: [dataValue] },
				},
			],
		});
	}
	return monad;
}

function updateNodeInStore(
	store: Record<string, GraphNode>,
	nodeId: string,
	toBeUpdated: Partial<GraphNode>
): Record<string, GraphNode> {
	if (!nodeId) {
		console.warn(`Missing id='${nodeId}' in graphOperation update node`);
		return store;
	}
	if (nodeId in store) {
		const node = store[nodeId];
		return { ...store, [nodeId]: { ...node, ...toBeUpdated } as GraphNode };
	} else {
		console.warn(`Missing id='${nodeId}' in graphOperation update node`);
		return store;
	}
}
