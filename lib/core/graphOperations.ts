import { PatchGraphMonad } from "./PatchGraphMonad";
import { GraphNode, PatchGraphResult } from "./types/types";



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