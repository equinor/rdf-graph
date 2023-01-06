import { BindFunction, PatchGraphMonad } from './PatchGraphMonad';
import { derivedPropKeys, directPropKeys } from './propConfig';
import {
	CustomProp,
	DerivedProp,
	DerivedPropKey,
	DirectProp,
	DirectPropKey,
	GraphEdge,
	GraphNode,
	GraphNodePatch,
	GraphPatch,
	GraphPropertyPatch,
	PatchDirectProp,
	PatchGraphResult,
	PredicateNode,
	Prop,
} from './types/core';

function toGraphPatch(node: GraphNode): GraphNodePatch {
	return { id: node.id, type: 'node', variant: node.variant } as GraphNodePatch;
}

export function addNode(node: GraphNode): BindFunction {
	return (state: PatchGraphResult) => {
		return new PatchGraphMonad({
			...state,
			graphState: {
				...state.graphState,
				nodeStore: { ...state.graphState.nodeStore, [node.id]: node },
			},
			graphPatches: [...state.graphPatches, { action: 'add', content: toGraphPatch(node) }],
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
			graphPatches: [...state.graphPatches, { action: 'remove', content: toGraphPatch(node) }],
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
				: [...state.graphPatches, { action: 'add', content: newEdge }],
		});
	};
}

export function deleteEdges(edgeIds: string[]): BindFunction {
	return (state: PatchGraphResult) => {
		const edgeStore = state.graphState.edgeStore;
		const edgePatches = Object.keys(edgeStore)
			.filter((key) => edgeIds.includes(key))
			.map((key) => {
				const p: GraphPatch = { action: 'remove', content: edgeStore[key] };
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

// Direct
// Derived
// Custom

// add
// remove

// Predicate
// Normal
export function addDerivedProp(
	node: GraphNode,
	key: DerivedPropKey,
	value: DerivedProp['value']
): BindFunction {
	return (state: PatchGraphResult) => {
		const store = state.graphState.nodeStore;

		const index = node.props.findIndex((p) => p.key === key);
		const newProp = { type: 'derived', key: key, value: value } as DerivedProp;
		const newPropArray = [...node.props.slice(0, index), newProp, ...node.props.slice(index + 1)];

		const newPatches: GraphPatch[] = [
			{
				action: 'add',
				content: {
					id: node.id,
					type: 'property',
					prop: newProp,
				} as GraphPropertyPatch,
			},
		];

		return new PatchGraphMonad({
			...state,
			graphState: {
				...state.graphState,
				nodeStore: updateNodeInStore(store, node.id, {
					props: newPropArray,
				}),
			},
			graphPatches: [...state.graphPatches, ...newPatches],
		});
	};
}

export function addProp(
	node: GraphNode,
	key: string,
	value: string | DerivedProp['value']
): BindFunction {
	return (state: PatchGraphResult) => {
		const store = state.graphState.nodeStore;

		const index = node.props.findIndex((p) => p.key === key);

		let newProp: Prop;

		if (derivedPropKeys.includes(key as DerivedPropKey)) {
			newProp = {
				type: 'derived',
				key: key as DerivedPropKey,
				value: value as DerivedProp['value'],
			} as DerivedProp;
		} else {
			newProp = createNewStringProp(store, node.id, key, value as string);
		}

		const newPropArray = [...node.props.slice(0, index), newProp, ...node.props.slice(index + 1)];

		const newPatches: GraphPatch[] = [
			{
				action: 'add',
				content: {
					id: node.id,
					type: 'property',
					prop: {
						...newProp,
						value: Array.isArray(newProp.value) ? newProp.value[0] : newProp.value,
					},
				} as GraphPropertyPatch,
			},
		];

		return new PatchGraphMonad({
			...state,
			graphState: {
				...state.graphState,
				nodeStore: updateNodeInStore(store, node.id, {
					props: newPropArray,
				}),
			},
			graphPatches: [...state.graphPatches, ...newPatches],
		});
	};
}

export function addDirectProp(
	node: GraphNode,
	key: DirectProp['key'],
	value: string
): BindFunction {
	return (state: PatchGraphResult) => {
		const store = state.graphState.nodeStore;

		const index = node.props.findIndex((p) => p.key === key);

		const newProp = createNewStringProp(store, node.id, key, value);

		const newPropArray = [...node.props.slice(0, index), newProp, ...node.props.slice(index + 1)];

		const newPatches: GraphPatch[] = [
			{
				action: 'add',
				content: {
					id: node.id,
					type: 'property',
					prop: { ...newProp, value: newProp.value[0] },
				} as GraphPropertyPatch,
			},
		];

		return new PatchGraphMonad({
			...state,
			graphState: {
				...state.graphState,
				nodeStore: updateNodeInStore(store, node.id, {
					props: newPropArray,
				}),
			},
			graphPatches: [...state.graphPatches, ...newPatches],
		});
	};
}

export function addDirectPropToPredicateNode(
	node: PredicateNode,
	key: DirectProp['key'],
	value: string
): BindFunction {
	return (state: PatchGraphResult) => {
		const store = state.graphState.predicateNodeStore;
		const index = node.props.findIndex((p) => p.key === key);

		const newPropArray = [
			...node.props.slice(0, index),
			createNewStringProp(store, node.id, key, value),
			...node.props.slice(index + 1),
		];

		return new PatchGraphMonad({
			...state,
			graphState: {
				...state.graphState,
				predicateNodeStore: updateNodeInStore(store, node.id, {
					props: newPropArray,
				}),
			},
		});
	};
}

export function deleteDirectProp(
	node: GraphNode,
	key: DirectProp['key'],
	value: string
): BindFunction {
	return (state: PatchGraphResult) => {
		const store = state.graphState.nodeStore;

		const index = node.props.findIndex((p) => p.key === key);

		const newPropArray = [
			...node.props.slice(0, index),
			...deleteProp(store, node.id, key, value),
			...node.props.slice(index + 1),
		];

		return new PatchGraphMonad({
			...state,
			graphState: {
				...state.graphState,
				nodeStore: updateNodeInStore(store, node.id, {
					props: newPropArray,
				}),
			},
			graphPatches: [
				...state.graphPatches,
				{
					action: 'remove',
					content: {
						id: node.id,
						type: 'property',
						prop: { key: key, type: 'direct', value: value } as PatchDirectProp,
					} as GraphPropertyPatch,
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
							content: { type: 'data', target: node, key: dataKey, values: [dataValue] },
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
					content: { type: 'data', target: node, key: dataKey, values: [] },
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
				content: { type: 'data', target: node, key: k, values: [] },
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
		const edge = state.graphState.edgeStore[edgeId];
		return new PatchGraphMonad({
			...state,
			graphState: state.graphState,
			graphPatches: [
				...state.graphPatches,
				{
					action: 'add',
					content: { type: 'property', target: edge, key: prop, value: propValue },
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

function createNewStringProp<T extends GraphNode | PredicateNode>(
	store: Record<string, T>,
	nodeId: string,
	key: DirectPropKey | string,
	value: string
): DirectProp | CustomProp {
	if (nodeId in store) {
		const node = store[nodeId];
		const index = node.props.findIndex((p) => p.key === key);

		if (index === -1) {
			if (directPropKeys.includes(key as DirectPropKey)) {
				return { key: key as DirectPropKey, type: 'direct', value: [value] };
			}
			return { key: key, type: 'custom', value: [value] };
		} else {
			return {
				...node.props[index],
				value: [...(node.props[index].value as string[]), value],
			} as DirectProp;
		}
	}
	throw 'please dont';
}

function deleteProp<T extends GraphNode | PredicateNode>(
	store: Record<string, T>,
	nodeId: string,
	key: DirectPropKey,
	value: string
): DirectProp[] {
	if (nodeId in store) {
		const node = store[nodeId];
		const index = node.props.findIndex((p) => p.key === key);

		if (index === -1) {
			throw 'Pleeese dont';
		} else {
			const oldValue = (node.props[index] as DirectProp).value;
			const valueIndex = oldValue.findIndex((v) => v === value);
			const newValue =
				valueIndex === -1
					? oldValue
					: [...oldValue.splice(0, valueIndex), ...oldValue.splice(valueIndex + 1)];

			if (newValue.length > 0) {
				return [{ type: 'direct', key: key, value: newValue }];
			} else {
				return [];
			}
		}
	}
	throw 'please dont';
}
