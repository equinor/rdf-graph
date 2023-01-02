import { BindFunction, PatchGraphMonad } from './PatchGraphMonad';
import {
	GraphEdge,
	GraphNode,
	GraphPatch,
	KnownProps,
	PatchGraphResult,
	PredicateNode,
} from './types/types';

export function addNode(node: GraphNode): BindFunction {
	return (state: PatchGraphResult) => {
		return new PatchGraphMonad({
			...state,
			graphState: {
				...state.graphState,
				nodeStore: { ...state.graphState.nodeStore, [node.id]: node },
			},
			graphPatches: [...state.graphPatches, { action: 'add', element: node }],
		});
	};
}

export function deleteNode(iri: string): BindFunction {
	return (state: PatchGraphResult) => {
		const store = state.graphState.nodeStore;
		const node = store[iri];
		return new PatchGraphMonad({
			...state,
			graphState: {
				...state.graphState,
				nodeStore: deleteEntriesFromRecord(store, [iri]),
			},
			graphPatches: [...state.graphPatches, { action: 'remove', element: node }],
		});
	};
}

export function addPredicateNode(predicateNode: PredicateNode): BindFunction {
	return (state: PatchGraphResult) => {
		return new PatchGraphMonad({
			...state,
			graphState: {
				...state.graphState,
				predicateNodeStore: {
					...state.graphState.predicateNodeStore,
					[predicateNode.id]: predicateNode,
				},
			},
		});
	};
}

export function addEdgeToPredicateNode(edgeId: string, predicateIri: string): BindFunction {
	return (state: PatchGraphResult) => {
		const pNode = state.graphState.predicateNodeStore[predicateIri];
		const predicateNode = {
			...pNode,
			edgeIds: [...pNode.edgeIds, edgeId],
		};
		return new PatchGraphMonad({
			...state,
			graphState: {
				...state.graphState,
				predicateNodeStore: {
					...state.graphState.predicateNodeStore,
					[predicateIri]: predicateNode,
				},
			},
		});
	};
}

export function addEdge(
	edgeId: string,
	predicateIri: string,
	sourceId: string,
	targetId: string,
	stateOnly: boolean = false
): BindFunction {
	return (state: PatchGraphResult) => {
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
			graphPatches: stateOnly
				? state.graphPatches
				: [...state.graphPatches, { action: 'add', element: newEdge }],
		});
	};
}

export function deleteEdges(edgeIds: string[]): BindFunction {
	return (state: PatchGraphResult) => {
		const edgeStore = state.graphState.edgeStore;
		const edgePatches = Object.keys(edgeStore)
			.filter((key) => edgeIds.includes(key))
			.map((key) => {
				const p: GraphPatch = { action: 'remove', element: edgeStore[key] };
				return p;
			});

		return new PatchGraphMonad({
			...state,
			graphState: {
				...state.graphState,
				edgeStore: deleteEntriesFromRecord(state.graphState.edgeStore, edgeIds),
			},
			graphPatches: [...state.graphPatches, ...edgePatches],
		});
	};
}

export function putKnownProp<P extends keyof KnownProps>(
	nodeIri: string,
	prop: P,
	propValue: KnownProps[P],
	stateOnly: boolean = false
): BindFunction {
	return (state: PatchGraphResult) => {
		const nodeStore = state.graphState.nodeStore;
		const predicateNodeStore = state.graphState.predicateNodeStore;

		const node = nodeStore[nodeIri];
		const predicateNode = predicateNodeStore[nodeIri];

		const newNodeStore = node
			? updateNodeInStore(nodeStore, nodeIri, {
					props: { ...node.props, [prop]: propValue },
			  })
			: nodeStore;

		const newPredicateStore = predicateNode
			? updateNodeInStore(predicateNodeStore, nodeIri, {
					props: { ...predicateNode.props, [prop]: propValue },
			  })
			: predicateNodeStore;

		const newPatches: GraphPatch[] = node
			? [
					{
						action: 'add',
						element: { type: 'property', target: node, key: prop, value: propValue },
					},
			  ]
			: [];

		return new PatchGraphMonad({
			...state,
			graphState: {
				...state.graphState,
				nodeStore: newNodeStore,
				predicateNodeStore: newPredicateStore,
			},
			// TODO handle different value types (for example string[] for hasConnector)
			graphPatches: stateOnly ? state.graphPatches : [...state.graphPatches, ...newPatches],
		});
	};
}

export function deleteKnownProp<P extends keyof KnownProps>(
	nodeIri: string,
	prop: P
): BindFunction {
	return (state: PatchGraphResult) => {
		const store = state.graphState.nodeStore;
		if (!(nodeIri in store)) return new PatchGraphMonad(state);

		const node = store[nodeIri];

		return new PatchGraphMonad({
			...state,
			graphState: {
				...state.graphState,
				nodeStore: updateNodeInStore(store, nodeIri, {
					props: { ...node.props, [prop]: undefined },
				}),
			},
			// TODO handle different value types (for example string[] for hasConnector)
			graphPatches: [
				...state.graphPatches,
				{
					action: 'remove',
					element: { type: 'property', target: node, key: prop, value: undefined },
				},
			],
		});
	};
}

export function putDataProp(
	nodeIri: string,
	dataKey: string,
	dataValue: string,
	stateOnly: boolean = false
): BindFunction {
	return (state: PatchGraphResult) => {
		const store = state.graphState.nodeStore;
		if (!(nodeIri in store)) return new PatchGraphMonad(state);

		const node = store[nodeIri];

		return new PatchGraphMonad({
			...state,
			graphState: {
				...state.graphState,
				nodeStore: updateNodeInStore(store, nodeIri, {
					data: { ...node.data, [dataKey]: dataValue },
				}),
			},
			graphPatches: stateOnly
				? state.graphPatches
				: [
						...state.graphPatches,
						{
							action: 'add',
							// TODO handle multiple object for a (subject, predicate)-pair
							element: { type: 'data', target: node, key: dataKey, values: [dataValue] },
						},
				  ],
		});
	};
}

export function deleteDataProp(nodeIri: string, dataKey: string): BindFunction {
	return (state: PatchGraphResult) => {
		const store = state.graphState.nodeStore;
		if (!(nodeIri in store)) return new PatchGraphMonad(state);
		const node = store[nodeIri];
		const newData = deleteEntriesFromRecord(node.data, [dataKey]);

		return new PatchGraphMonad({
			...state,
			graphState: {
				...state.graphState,
				nodeStore: updateNodeInStore(store, nodeIri, {
					data: newData,
				}),
			},
			graphPatches: [
				...state.graphPatches,

				// TODO handle multiple object for a (subject, predicate)-pair
				{
					action: 'remove',
					element: { type: 'data', target: node, key: dataKey, values: [] },
				},
			],
		});
	};
}

export function deleteAllDataProps(nodeIri: string): BindFunction {
	return (state: PatchGraphResult) => {
		const store = state.graphState.nodeStore;
		if (!(nodeIri in store)) return new PatchGraphMonad(state);
		const node = store[nodeIri];

		const removePatches: GraphPatch[] = Object.keys(node.data).map((k) => {
			return {
				action: 'remove',
				element: { type: 'data', target: node, key: k, values: [] },
			};
		});

		return new PatchGraphMonad({
			...state,
			graphState: {
				...state.graphState,
				nodeStore: updateNodeInStore(store, nodeIri, {
					data: {},
				}),
			},
			graphPatches: [...state.graphPatches, ...removePatches],
		});
	};
}

export function addEdgeProp<P extends keyof KnownProps>(
	edgeId: string,
	prop: P,
	propValue: KnownProps[P]
): BindFunction {
	return (state: PatchGraphResult) => {
		return new PatchGraphMonad({
			...state,
			graphState: state.graphState,
			graphPatches: [
				...state.graphPatches,
				{
					action: 'add',
					element: { type: 'edgeProperty', target: edgeId, key: prop, value: propValue },
				},
			],
		});
	};
}

function deleteEntriesFromRecord<T>(record: Record<string, T>, ids: string[]) {
	const newRecord: Record<string, T> = {};
	for (let key in record) {
		if (!ids.includes(key)) {
			newRecord[key] = record[key];
		}
	}
	return newRecord;
}

function updateNodeInStore<T>(
	store: Record<string, T>,
	nodeId: string,
	toBeUpdated: Partial<T>
): Record<string, T> {
	if (nodeId in store) {
		const node = store[nodeId];
		return { ...store, [nodeId]: { ...node, ...toBeUpdated } as T };
	}
	console.warn(`Missing id='${nodeId}' in graphOperation update node`);
	return store;
}
