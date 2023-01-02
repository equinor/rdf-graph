import { termToId } from 'n3';
import { nanoid } from 'nanoid';
import {
	addEdge,
	addEdgeProp,
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
		const nodeExists =
			subjectIri in state.graphState.nodeStore || subjectIri in state.graphState.predicateNodeStore;
		if (rdfPatch.action === 'add' && !nodeExists) {
			return new PatchGraphMonad(state).bind(addNewNode(subjectIri, 'default'));
		}
		return new PatchGraphMonad(state);
	};
}

export function ensureObjectNode(rdfPatch: RdfPatch): BindFunction {
	return (state: PatchGraphResult) => {
		const objectIri = termToId(rdfPatch.data.object);
		const nodeExists =
			objectIri in state.graphState.nodeStore || objectIri in state.graphState.predicateNodeStore;
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
		} else if (!(predicateIri in state.graphState.predicateNodeStore)) {
			bindings.push(addNewNode(predicateIri, 'predicate'));
		}

		bindings.push(addEdgeToPredicateNode(edgeId, predicateIri));
		bindings.push(yieldEdgeProps(predicateIri));

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
			return new PatchGraphMonad(state)
				.bind(putKnownProp(subjectIri, key, objectLiteral))
				.bind(yieldEdgeProps(subjectIri));
		} else {
			return new PatchGraphMonad(state).bind(putDataProp(subjectIri, predicateIri, objectLiteral));
		}
	};
}

function yieldEdgeProps(predicateIri: string): BindFunction {
	return (state: PatchGraphResult) => {
		const graphState = state.graphState;
		const predicateStore = graphState.predicateNodeStore;

		const bindings: BindFunction[] = [];
		if (predicateIri in predicateStore) {
			const predicateNode = predicateStore[predicateIri];
			const existingProps = knownPropKeys.filter((key) => predicateNode.props[key]);

			bindings.push(
				...existingProps.flatMap((p) =>
					predicateNode.edgeIds.map((edgeId) => {
						return addEdgeProp(edgeId, p, predicateNode.props[p]);
					})
				)
			);
		}
		return new PatchGraphMonad(state).bindMany(bindings);
	};
}

function convertNode(
	nodeIri: string,
	variant: NodeVariantInternal,
	symbolNodeRef?: SymbolNode
): BindFunction {
	return (state: PatchGraphResult) => {
		const graphState = state.graphState;

		// remember edges
		const edgeStore = graphState.edgeStore;
		const edgeKeys = Object.keys(edgeStore);
		const outgoing = edgeKeys
			.filter((key) => edgeStore[key].sourceId === nodeIri)
			.map((key) => edgeStore[key]);
		const incoming = edgeKeys
			.filter((key) => edgeStore[key].targetId === nodeIri)
			.map((key) => edgeStore[key]);

		const oldEdges = outgoing.concat(incoming);

		// remember node
		const nodeStore = graphState.nodeStore;
		const predicateStore = graphState.predicateNodeStore;
		const oldNode = nodeIri in nodeStore ? nodeStore[nodeIri] : predicateStore[nodeIri];

		// remember props
		const props = oldNode.props;
		const existingProps = knownPropKeys.filter((key) => props[key]);

		// remember data
		const data = oldNode.data;

		const bindings: BindFunction[] = [];
		// create bindings to delete old stuff
		bindings.push(...existingProps.map((key) => deleteKnownProp(nodeIri, key)));
		bindings.push(deleteAllDataProps(nodeIri));
		bindings.push(deleteEdges(oldEdges.map((e) => e.id)));
		bindings.push(deleteNode(nodeIri));
		bindings.push(addNewNode(nodeIri, variant, symbolNodeRef));

		// create bindings to readd stuff. For predicates, props are handled elsewhere
		const stateOnly = variant === 'predicate';
		bindings.push(...existingProps.map((key) => putKnownProp(nodeIri, key, props[key], stateOnly)));
		bindings.push(
			...Object.keys(data).map((key) => putDataProp(nodeIri, key, data[key], stateOnly))
		);
		bindings.push(
			...oldEdges.map((e) => addEdge(e.id, e.predicateIri, e.sourceId, e.targetId, stateOnly))
		);

		return new PatchGraphMonad(state).bindMany(bindings);
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
