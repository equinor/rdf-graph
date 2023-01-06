import { BindFunction, PatchGraphMonad } from './PatchGraphMonad';
import {
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

export function addProp(
	node: GraphNode,
	newProp: Prop
): BindFunction {
	return (state: PatchGraphResult) => {
		const store = state.graphState.nodeStore;

		const index = node.props.findIndex((p) => p.key === newProp.key);

		const newPropArray = index === -1 ?
			[...node.props, newProp]
			:
			[...node.props.slice(0, index), newProp, ...node.props.slice(index + 1)];

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


export function addPropToPredicateNode(
	node: GraphNode,
	newProp: Prop
): BindFunction {
	return (state: PatchGraphResult) => {
		const store = state.graphState.predicateNodeStore;
		const index = node.props.findIndex((p) => p.key === newProp.key);

		const newPropArray = index === -1 ?
			[...node.props, newProp]
			:
			[...node.props.slice(0, index), newProp, ...node.props.slice(index + 1)];

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

export function deletePredicateProp(
	node: GraphNode,
	prop: Prop,
	value: unknown
): BindFunction {
	return (state: PatchGraphResult) => {
		const store = state.graphState.nodeStore;

		const index = node.props.findIndex((p) => p.key === prop.key);

		const newPropArray = [
			...node.props.slice(0, index),
			...deleteProp(store, node.id, prop, value),
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
						prop: { key: prop.key, type: 'direct', value: value } as PatchDirectProp,
					} as GraphPropertyPatch,
				},
			],
		});
	};
}

export function addEdgeProp(
	edgeId: string,
	propKey: DirectPropKey,
	propValue: string
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
					content: {
						type: 'property', id: edge.id, prop: {
							type: 'direct',
							key: propKey,
							value: propValue
						},
					},
				}
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



function deleteProp<T extends GraphNode | PredicateNode>(
	store: Record<string, T>,
	nodeId: string,
	prop: Prop,
	value: unknown
): Prop[] {
	if (nodeId in store) {
		const node = store[nodeId];
		const index = node.props.findIndex((p) => p.key === prop.key);

		if (index === -1) {
			throw 'Pleeese dont';
		} else {
			const oldValue = prop.value;
			if (Array.isArray(oldValue)) {
				const valueIndex = oldValue.findIndex((v) => v === value);
				const newValue =
					valueIndex === -1
						? oldValue
						: [...oldValue.splice(0, valueIndex), ...oldValue.splice(valueIndex + 1)];

				if (newValue.length > 0) {
					return [{ ...prop, value: newValue } as Prop];
				}
			}
			return [];
		}
	}
	throw 'please dont';
}
