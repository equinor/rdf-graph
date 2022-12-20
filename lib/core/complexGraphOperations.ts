import { termToId } from "n3";
import { nanoid } from "nanoid";
import { addEdge, addNode, addPredicateNode, putDataProp, putKnownProp } from "./baseGraphOperations";
import { BindFunction, PatchGraphMonad } from "./PatchGraphMonad";
import { knownPropKeys, PatchGraphResult, PROPS, RdfPatch } from "./types/types";

export function ensureSubjectNode(rdfPatch: RdfPatch): BindFunction {
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

export function ensureObjectNode(rdfPatch: RdfPatch): BindFunction {
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

export function ensurePredicateNodeWithEdge(rdfPatch: RdfPatch): BindFunction {
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

export function ensurePredicateProp(rdfPatch: RdfPatch): BindFunction {
	const f = (state: PatchGraphResult) => {
		const monad = new PatchGraphMonad(state);
		if (objectIsIri(rdfPatch)) return monad;

		const { subjectIri, predicateIri, objectTerm } = getTripleAsString(rdfPatch);

		// Remove quotes
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

function objectIsIri(rdfPatch: RdfPatch) {
	return rdfPatch.data.object.termType !== 'Literal';
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