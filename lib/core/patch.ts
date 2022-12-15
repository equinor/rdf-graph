import { Quad, termFromId, termToId, Writer, DataFactory } from 'n3';
import {
	GraphElement,
	GraphElementInternal,
	GraphNode,
	GraphPatch,
	GraphState,
	RdfPatch,
	SymbolProvider,
} from './types/types';

type PatchGraphResult = {
	graphState: GraphState;
	graphPatches: GraphPatch[];
};

type PatchGraphOptions = {
	symbolProvider: SymbolProvider;
};

const defaultSymbolProvider: SymbolProvider = (id, rotation) => {
	// TODO: implement
	return undefined;
};

export function patchGraphState(
	state: GraphState,
	rdfPatches: RdfPatch[],
	options?: Partial<PatchGraphOptions>
): PatchGraphResult {
	return {
		graphState: state,
		graphPatches: rdfPatches.flatMap((rdfPatch) => rdfToGraphPatch(state, rdfPatch, options)),
	};
}

// key => (inputKey[], (subject, graphState) => graphState, graphPatch[])

// svgId =>
// rotation =>
// svgImage => (svgId, rotation), (someSvgNode, graphState) => getSymbol(svgId, rotaiton) /*update node with output (and yield prop)

//

// a hasColor "green"

export function rdfToGraphPatch(
	state: GraphState,
	{ action, data }: RdfPatch,
	options?: Partial<PatchGraphOptions>
): GraphPatch[] {
	// ADD ----------------

	// Potential new node handling
	// --- Add subject to state if not exist
	// --- Add object to state if not exist and not iri
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

	let sNode: GraphElementInternal, pNode: GraphElementInternal, oNode: GraphElementInternal;
	const q = data;
	const sTerm = termToId(q.subject);
	const pTerm = termToId(q.predicate);
	const oTerm = termToId(q.object);

	const result: GraphPatch[] = [];

	const symbolProvider = options?.symbolProvider ?? defaultSymbolProvider;

	if (action === 'add') {
		// Add subject and yield if not exists
		if (sTerm in state.nodeStore) {
			sNode = state.nodeStore[sTerm];
		} else {
			sNode = { id: sTerm, type: 'node', variant: 'default' } as GraphNode;
			state.nodeStore[sTerm] = sNode;
			result.push({ action: 'add', element: sNode });
		}

		if (q.object.termType === 'Literal') {
			return result;
		}

		// Add object and yield if not exists and != literal
		if (oTerm in state.nodeStore) {
			oNode = state.nodeStore[oTerm];
		} else {
			oNode = { id: oTerm, type: 'node', variant: 'default' } as GraphNode;
			state.nodeStore[oTerm] = oNode;
			result.push({ action: 'add', element: oNode });
		}

		// predicate handling when object is a literal
		if (sNode.variant === 'default') {
		}
	} else {
	}

	return result;
}
