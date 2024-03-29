import {
	applyRules,
	cleanEmptyNodes,
	ensureEdgeRemoved,
	ensureObjectNode,
	ensurePredicateNodeWithEdge,
	ensurePredicatePropAdded,
	ensurePredicatePropRemoved,
	ensureSubjectNode,
} from './complexGraphOperations';
import { BindFunction, PatchGraphMonad } from './PatchGraphMonad';

import { GraphState, PatchGraphResult, RdfPatch, UiSymbolProvider } from './types';

export type PatchGraphOptions = {
	symbolProvider: UiSymbolProvider;
};

const defaultOptions: PatchGraphOptions = {
	symbolProvider: (_id: string, _rotation?: number) => {
		throw new Error('Symbol Provider not defined!');
		//return getConnectorSymbolAdvanced(id as SymbolLibraryKey, { rotation: rotation }),
	},
};

export function patchGraphState(
	state: GraphState,
	rdfPatches: RdfPatch[],
	options?: Partial<PatchGraphOptions>
): PatchGraphResult {
	return new PatchGraphMonad({
		graphState: state,
		graphPatches: [],
	})
		.bind(rdfToGraphPatch(rdfPatches, options ? { ...defaultOptions, ...options } : defaultOptions))
		.getState();
}

function rdfToGraphPatch(rdfPatches: RdfPatch[], options: PatchGraphOptions): BindFunction {
	return (state: PatchGraphResult) =>
		rdfPatches.reduce((acc, rdfPatch) => {
			const bindings: BindFunction[] = [];
			if (rdfPatch.action === 'add') {
				bindings.push(
					ensureSubjectNode(rdfPatch),
					ensureObjectNode(rdfPatch),
					ensurePredicateNodeWithEdge(rdfPatch),
					ensurePredicatePropAdded(rdfPatch)
				);
			} else {
				bindings.push(
					ensurePredicatePropRemoved(rdfPatch),
					ensureEdgeRemoved(rdfPatch),
					cleanEmptyNodes(rdfPatch)
				);
			}
			bindings.push(applyRules(rdfPatch, options));
			return acc.bindMany(bindings);
		}, new PatchGraphMonad(state));
}

// ADD ----------------

// Potential new node handling
// --- Add subject to state if not exist
// --- Add object to state if not exist and iri
// --- Yield subject if not exist
// --- Yield object if not exist and iri

// Edge handling when object is an iri
// --- Add edge as predicate node if not exist
// --- Add edgeRef to predicate node
// --- Yield edge (if not exist)
// --- Yield edge properties for all edges predicate node knows about
// --- apply prop rules recursively

// Prop handling when object is a literal
// --- if subject is a predicate node:
// --- --- add prop to predicate node state:
// --- --- yield prop on all related edges
// --- else
// --- --- add prop P to subject's state
// --- --- Yield prop P
// --- --- apply prop rules recursively from P

// REMOVE ----------------

// predicate handling when object is a literal
// --- if subject is a predicate node:
// --- --- remove prop P from predicate node
// --- --- yield rm P
// --- else:
// --- --- apply prop rules recursively from P
