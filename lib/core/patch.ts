import { termToId } from 'n3';
import { nanoid } from 'nanoid';
import { addEdge, addNode, addPredicateNode, putDataProp, putKnownProp } from './graphOperations';
import { BindFunction, PatchGraphMonad } from './PatchGraphMonad';
import {
	GraphState,
	knownPropKeys,
	PatchGraphResult,
	PROPS,
	RdfPatch,
	SymbolProvider,
} from './types/types';

type PatchGraphOptions = {
	symbolProvider: SymbolProvider;
};

const _defaultSymbolProvider: SymbolProvider = (_id, _rotation) => {
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

export function rdfToGraphPatch(
	rdfPatches: RdfPatch[],
	_options?: Partial<PatchGraphOptions>
): BindFunction {
	const f = (state: PatchGraphResult) => {
		return rdfPatches.reduce((acc, rdfPatch) => {
			if (rdfPatch.action === 'add') {
				return acc
					.bind(addSubjectNode(rdfPatch))
					.bind(addObjectNode(rdfPatch))
					.bind(ensurePredicateNodeWithEdge(rdfPatch))
					.bind(ensurePredicateProp(rdfPatch));
			} else {
				return acc;
			}
		}, new PatchGraphMonad(state));
	};
	return f;
}

function addSubjectNode(rdfPatch: RdfPatch): BindFunction {
	const f = (state: PatchGraphResult) => {
		const subjectIri = termToId(rdfPatch.data.subject);
		const nodeExists = subjectIri in state.graphState.nodeStore;
		if (rdfPatch.action === 'add' && !nodeExists) {
			return addNode(state, subjectIri);
		}
		return new PatchGraphMonad(state);
	};
	return f;
}

function objectIsIri(rdfPatch: RdfPatch) {
	return rdfPatch.data.object.termType !== 'Literal';
}

function addObjectNode(rdfPatch: RdfPatch): BindFunction {
	const f = (state: PatchGraphResult) => {
		const objectIri = termToId(rdfPatch.data.object);
		const nodeExists = objectIri in state.graphState.nodeStore;
		if (rdfPatch.action === 'add' && !nodeExists && objectIsIri(rdfPatch)) {
			return addNode(state, objectIri);
		}
		return new PatchGraphMonad(state);
	};
	return f;
}

function ensurePredicateNodeWithEdge(rdfPatch: RdfPatch): BindFunction {
	const f = (state: PatchGraphResult) => {
		if (!objectIsIri(rdfPatch)) return new PatchGraphMonad(state);
		const edgeId = nanoid();
		const { subjectIri, predicateIri, objectTerm } = getTripleAsString(rdfPatch);
		const next = addEdge(state, edgeId, predicateIri, subjectIri, objectTerm).getState();
		// TODO: Handle node exists in nodeStore (ie. currently used as subject or object)
		return addPredicateNode(next, predicateIri, edgeId);
	};
	return f;
}

function ensurePredicateProp(rdfPatch: RdfPatch): BindFunction {
	const f = (state: PatchGraphResult) => {
		const monad = new PatchGraphMonad(state);
		if (objectIsIri(rdfPatch)) return monad;

		const { subjectIri, predicateIri, objectTerm } = getTripleAsString(rdfPatch);

		const objectLiteral = objectTerm.slice(1, -1);

		const key = knownPropKeys.find((k) => PROPS[k].iri === predicateIri);
		if (key) {
			return putKnownProp(monad, subjectIri, key, objectLiteral);
		} else {
			return putDataProp(monad, subjectIri, predicateIri, objectLiteral);
		}
	};
	return f;
}

type TripleAsStrings = {
	subjectIri: string;
	predicateIri: string;
	objectTerm: string;
};

function getTripleAsString(rdfPatch: RdfPatch): TripleAsStrings {
	return {
		subjectIri: termToId(rdfPatch.data.subject),
		predicateIri: termToId(rdfPatch.data.predicate),
		objectTerm: termToId(rdfPatch.data.object),
	};
}
