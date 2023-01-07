import {
	applyRules,
	ensureObjectNode,
	ensurePredicateNodeWithEdge,
	ensurePredicateProp,
	ensureSubjectNode,
} from './complexGraphOperations';
import { BindFunction, PatchGraphMonad } from './PatchGraphMonad';
import { UiSymbolProvider } from './types/UiSymbol';
import { GraphState, PatchGraphResult, RdfPatch } from './types/core';

export type PatchGraphOptions = {
	symbolProvider: UiSymbolProvider;
};

const _defaultSymbolProvider: UiSymbolProvider = (_id, _rotation) => {
	// TODO: implement
	return undefined;
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
		.bind(rdfToGraphPatch(rdfPatches, options))
		.getState();
}

function rdfToGraphPatch(
	rdfPatches: RdfPatch[],
	options?: Partial<PatchGraphOptions>
): BindFunction {
	const f = (state: PatchGraphResult) => {
		return rdfPatches.reduce((acc, rdfPatch) => {
			if (rdfPatch.action === 'add') {
				return acc
					.bind(ensureSubjectNode(rdfPatch))
					.bind(ensureObjectNode(rdfPatch))
					.bind(ensurePredicateNodeWithEdge(rdfPatch))
					.bind(ensurePredicateProp(rdfPatch))
					.bind(applyRules(rdfPatch, options));
			} else {
				return acc;
			}
		}, new PatchGraphMonad(state));
	};
	return f;
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
