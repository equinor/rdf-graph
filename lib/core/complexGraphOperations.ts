import { termToId } from 'n3';
import { nanoid } from 'nanoid';
import {
	addEdge,
	addEdgeToPredicateNode,
	addNode,
	addPredicateNode,
	deleteAllDataProps,
	deleteEdges,
	deleteKnownProp,
	deleteNode,
	putDataProp,
	putKnownProp,
} from './baseGraphOperations';
import { BindFunction, PatchGraphMonad } from './PatchGraphMonad';
import {
	knownPropKeys,
	NodeVariantInternal,
	PatchGraphResult,
	PROPS,
	RdfPatch,
	SymbolNode,
} from './types/types';

export function ensureSubjectNode(rdfPatch: RdfPatch): BindFunction {
	return (state: PatchGraphResult) => {
		const subjectIri = termToId(rdfPatch.data.subject);
		const nodeExists = subjectIri in state.graphState.nodeStore;
		if (rdfPatch.action === 'add' && !nodeExists) {
			return new PatchGraphMonad(state).bind(addNewNode(subjectIri, 'default'));
		}
		return new PatchGraphMonad(state);
	};
}

export function ensureObjectNode(rdfPatch: RdfPatch): BindFunction {
	return (state: PatchGraphResult) => {
		const objectIri = termToId(rdfPatch.data.object);
		const nodeExists = objectIri in state.graphState.nodeStore;
		if (rdfPatch.action === 'add' && !nodeExists && objectIsIri(rdfPatch)) {
			return new PatchGraphMonad(state).bind(addNewNode(objectIri, 'default'));
		}
		return new PatchGraphMonad(state);
	};
}

export function ensurePredicateNodeWithEdge(rdfPatch: RdfPatch): BindFunction {
	return (state: PatchGraphResult) => {
		if (!objectIsIri(rdfPatch)) return new PatchGraphMonad(state);

		let bindings: BindFunction[] = [];
		const edgeId = nanoid();
		const { subjectIri, predicateIri, objectTerm } = getTripleAsString(rdfPatch);

		bindings.push(addEdge(edgeId, predicateIri, subjectIri, objectTerm));

		if (predicateIri in state.graphState.nodeStore) {
			bindings.push(convertNode(predicateIri, 'predicate'));
		} else {
			bindings.push(addNewNode(predicateIri, 'predicate'));
		}

		bindings.push(addEdgeToPredicateNode(edgeId, predicateIri));

		return new PatchGraphMonad(state).bindMany(bindings);
	};
}

export function ensurePredicateProp(rdfPatch: RdfPatch): BindFunction {
	return (state: PatchGraphResult) => {
		if (objectIsIri(rdfPatch)) return new PatchGraphMonad(state);

		const { subjectIri, predicateIri, objectTerm } = getTripleAsString(rdfPatch);

		// Remove quotes
		const objectLiteral = objectTerm.slice(1, -1);

		const key = knownPropKeys.find((k) => PROPS[k].iri === predicateIri);
		if (key) {
			return new PatchGraphMonad(state).bind(putKnownProp(subjectIri, key, objectLiteral));
		} else {
			return new PatchGraphMonad(state).bind(putDataProp(subjectIri, predicateIri, objectLiteral));
		}
	};
}

function convertNode(
	nodeIri: string,
	variant: NodeVariantInternal,
	symbolNodeRef?: SymbolNode
): BindFunction {
	return (state: PatchGraphResult) => {
		const graphState = state.graphState;

		//edge stuff
		const edgeStore = graphState.edgeStore;
		const edgeKeys = Object.keys(edgeStore);

		const outgoing = edgeKeys
			.filter((key) => edgeStore[key].sourceId === nodeIri)
			.map((key) => edgeStore[key]);
		const incoming = edgeKeys
			.filter((key) => edgeStore[key].targetId === nodeIri)
			.map((key) => edgeStore[key]);

		//node stuff
		const nodeStore = graphState.nodeStore;
		const predicateStore = graphState.nodeStore;
		const oldNode = nodeIri in nodeStore ? nodeStore[nodeIri] : predicateStore[nodeIri];
		const props = oldNode.props;
		const data = oldNode.data;

		const existingProps = knownPropKeys.filter((key) => props[key]);
		const deleteAllKnownProps = existingProps.map((key) => deleteKnownProp(nodeIri, key));
		const addAllKnownProps = existingProps.map((key) => putKnownProp(nodeIri, key, props[key]));
		const addAllData = Object.keys(data).map((key) => putDataProp(nodeIri, key, data[key]));
		const addAllEdges = incoming
			.concat(outgoing)
			.map((e) => addEdge(e.id, e.predicateIri, e.sourceId, e.targetId));

		return new PatchGraphMonad(state)
			.bindMany(deleteAllKnownProps)
			.bind(deleteAllDataProps(nodeIri))
			.bind(deleteEdges(edgeKeys))
			.bind(deleteNode(nodeIri))
			.bind(addNewNode(nodeIri, variant, symbolNodeRef))
			.bindMany(addAllKnownProps)
			.bindMany(addAllData)
			.bindMany(addAllEdges);
	};
}

function addNewNode(
	nodeIri: string,
	variant: NodeVariantInternal,
	symbolNodeRef?: SymbolNode
): BindFunction {
	return (state: PatchGraphResult) => {
		const monad = new PatchGraphMonad(state);
		if (variant === 'predicate') {
			return monad.bind(
				addPredicateNode({
					id: nodeIri,
					type: 'node',
					variant: 'predicate',
					data: {},
					edgeIds: [],
					props: {},
				})
			);
		} else if (variant === 'connector') {
			return monad.bind(
				addNode({
					id: nodeIri,
					type: 'node',
					variant: 'connector',
					data: {},
					props: {},
					symbolNodeRef: symbolNodeRef as SymbolNode,
				})
			);
		} else {
			return monad.bind(
				addNode({
					id: nodeIri,
					type: 'node',
					variant: variant,
					data: {},
					props: {},
				})
			);
		}
	};
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
