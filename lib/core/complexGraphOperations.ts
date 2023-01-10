import { termToId } from 'n3';
import crypto from 'crypto';

import {
	createEdgeChange,
	addEdgeToPredicateNode,
	addNode,
	addPredicateNode,
	addProp,
	addPropToPredicateNode,
	burninatePropFromNode,
	deleteEdges,
	deleteNode,
	deletePropFromNode,
	deletePropFromPredicateNode,
} from './baseGraphOperations';
import { PatchGraphOptions } from './patch';
import { BindFunction, PatchGraphMonad } from './PatchGraphMonad';
import { directPropConfig, directPropKeys, RuleInputs } from './propConfig';
import {
	GraphNode,
	NodeVariantInternal,
	PatchGraphResult,
	PredicateNode,
	Prop,
	RdfPatch,
} from './types/core';

export function ensureSubjectNode(rdfPatch: RdfPatch): BindFunction {
	return (state: PatchGraphResult) => {
		const subjectIri = termToId(rdfPatch.data.subject);
		const nodeExists =
			subjectIri in state.graphState.nodeStore || subjectIri in state.graphState.predicateNodeStore;
		if (rdfPatch.action === 'add' && !nodeExists) {
			const newNode = createNewNode(subjectIri, 'default') as GraphNode;
			return new PatchGraphMonad(state).bind(addNode(newNode));
		}
		return new PatchGraphMonad(state);
	};
}

export function ensureObjectNode(rdfPatch: RdfPatch): BindFunction {
	return (state: PatchGraphResult) => {
		const objectIri = termToId(rdfPatch.data.object);
		const nodeExists =
			objectIri in state.graphState.nodeStore || objectIri in state.graphState.predicateNodeStore;
		if (rdfPatch.action === 'add' && !nodeExists && isEdgePatch(rdfPatch)) {
			const newNode = createNewNode(objectIri, 'default') as GraphNode;
			return new PatchGraphMonad(state).bind(addNode(newNode));
		}
		return new PatchGraphMonad(state);
	};
}

export function ensurePredicateNodeWithEdge(rdfPatch: RdfPatch): BindFunction {
	return (state: PatchGraphResult) => {
		const { subjectIri, predicateIri, objectTerm } = getTripleAsString(rdfPatch);

		if (isPropPatch(rdfPatch)) return new PatchGraphMonad(state);

		let bindings: BindFunction[] = [];
		
		// For library to be used with or without window (unittest vs normal client)
		const edgeId = window.crypto.randomUUID ? window.crypto.randomUUID() : crypto.randomUUID();

		bindings.push(createEdgeChange(edgeId, predicateIri, subjectIri, objectTerm, 'add'));

		if (predicateIri in state.graphState.nodeStore) {
			bindings.push(convertNode(predicateIri, 'predicate'));
		} else if (!(predicateIri in state.graphState.predicateNodeStore)) {
			bindings.push(addPredicateNode(createNewNode(predicateIri, 'predicate') as PredicateNode));
		}
		bindings.push(addEdgeToPredicateNode(edgeId, predicateIri));

		return new PatchGraphMonad(state).bindMany(bindings);
	};
}

export function ensureEdgeRemoved(rdfPatch: RdfPatch): BindFunction {
	return (state: PatchGraphResult) => {
		const { subjectIri, predicateIri, objectTerm } = getTripleAsString(rdfPatch);

		if (isPropPatch(rdfPatch)) return new PatchGraphMonad(state);

		let bindings: BindFunction[] = [];

		const edgeStore = state.graphState.edgeStore;
		const edgeId = Object.keys(edgeStore).find(edgeKey => {
			const edge = edgeStore[edgeKey];
			return edge.sourceId === subjectIri && edge.predicateIri === predicateIri && edge.targetId === objectTerm
		});

		if (! edgeId) {
			console.warn("Asked to delete non existing edge");
			return new PatchGraphMonad(state);
		}

		bindings.push(createEdgeChange(edgeId, predicateIri, subjectIri, objectTerm, 'remove'));

		const predicateNode = state.graphState.predicateNodeStore[predicateIri];

		if (predicateNode.edgeIds.length === 0) {
			bindings.push(convertNode(predicateIri, 'default'));
		}

		return new PatchGraphMonad(state).bindMany(bindings);
	};
}

export function ensurePredicatePropAdded(rdfPatch: RdfPatch): BindFunction {
	return (state: PatchGraphResult) => {
		const { subjectIri, predicateIri, objectTerm } = getTripleAsString(rdfPatch);

		const directKey = directPropKeys.find((k) => directPropConfig[k].iri === predicateIri);

		if (isEdgePatch(rdfPatch)) return new PatchGraphMonad(state);

		const node = state.graphState.nodeStore[subjectIri];
		const predicateNode = state.graphState.predicateNodeStore[subjectIri];
		const activeNode = node === undefined ? predicateNode : node;

		// Remove quotes or `<>`
		const objectLiteral = objectTerm.slice(1, -1);
		// NOTE: Derived props are ONLY added via prop rules!

		const key = directKey ? directKey : predicateIri;

		const index = activeNode.props.findIndex((p) => p.key === key);
		const value =
			index === -1
				? [objectLiteral]
				: [...(activeNode.props[index].value as string[]), objectLiteral];
		const prop: Prop = directKey
			? { key: directKey, type: 'direct', value }
			: { key: predicateIri, type: 'custom', value };

		if (node) {
			return new PatchGraphMonad(state).bind(addProp(node, prop));
		} else if (predicateNode) {
			return new PatchGraphMonad(state).bind(addPropToPredicateNode(predicateNode.id, prop));
		} else {
			console.warn(
				`Expected subject node with iri ${subjectIri} to be in a node store at this point.`
			);
			return new PatchGraphMonad(state);
		}
	};
}

export function ensurePredicatePropRemoved(rdfPatch: RdfPatch): BindFunction {
	return (state: PatchGraphResult) => {
		const { subjectIri, predicateIri, objectTerm } = getTripleAsString(rdfPatch);

		const directKey = directPropKeys.find((k) => directPropConfig[k].iri === predicateIri);


		if (isEdgePatch(rdfPatch)) return new PatchGraphMonad(state);

		const node = state.graphState.nodeStore[subjectIri];
		const predicateNode = state.graphState.predicateNodeStore[subjectIri];
		const activeNode = node === undefined ? predicateNode : node;

		// Remove quotes or `<>`
		const oLiteralOrIri = objectTerm.slice(1, -1);
		// NOTE: Derived props are ONLY removed via prop rules!

		const key = directKey ? directKey : predicateIri;

		const index = activeNode.props.findIndex((p) => p.key === key);
		if (index === -1) {
			console.warn("Asked to remove non existing prop")
			return new PatchGraphMonad(state);
		}

		const prop = activeNode.props[index];

		if (node) {
			return new PatchGraphMonad(state).bind(deletePropFromNode(node, prop, oLiteralOrIri));
		} else if (predicateNode) {
			return new PatchGraphMonad(state).bind(deletePropFromPredicateNode(predicateNode, prop, oLiteralOrIri));
		} else {
			console.warn(
				`Expected subject node with iri ${subjectIri} to be in a node store at this point.`
			);
			return new PatchGraphMonad(state);
		}
	};
}

export function applyRules(rdfPatch: RdfPatch, options?: Partial<PatchGraphOptions>): BindFunction {
	return (state: PatchGraphResult) => {
		const { subjectIri, predicateIri, objectTerm } = getTripleAsString(rdfPatch);

		const key = directPropKeys.find((k) => directPropConfig[k].iri === predicateIri);

		if (!key) {
			return new PatchGraphMonad(state);
		}

		const config = directPropConfig[key];

		if (!config.rule) {
			return new PatchGraphMonad(state);
		}

		const target: RuleInputs = {
			subjectIri: subjectIri,
			objectIri: objectTerm,
			symbolProvider: options?.symbolProvider,
		};

		return new PatchGraphMonad(state).bind(config.rule(target));
	};
}

export function convertNode(
	nodeIri: string,
	variant: NodeVariantInternal,
	symbolNodeIri?: string
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
		const normalNode = nodeStore[nodeIri];
		const oldPredicateNode = graphState.predicateNodeStore[nodeIri];
		const oldNode = normalNode ?? oldPredicateNode;

		const bindings: BindFunction[] = [];
		// create bindings to delete old stuff

		bindings.push(...oldNode.props.map((prop) => burninatePropFromNode(oldNode, prop)));
		bindings.push(deleteEdges(oldEdges.map((e) => e.id)));
		bindings.push(deleteNode(nodeIri));
		let symbolNode = undefined;
		if (variant === 'connector' && symbolNodeIri) {
			symbolNode = state.graphState.nodeStore[symbolNodeIri];
		}
		const newNode = createNewNode(nodeIri, variant, symbolNode);

		// create bindings to readd stuff. For predicates, props are handled elsewhere
		if (variant === 'predicate') {
			bindings.push(addPredicateNode(newNode as PredicateNode));
			bindings.push(...oldNode.props.map((prop) => addPropToPredicateNode(newNode.id, prop)));
		} else {
			bindings.push(addNode(newNode as GraphNode));
			bindings.push(...oldNode.props.map((prop) => addProp(oldNode, prop)));
			bindings.push(...oldEdges.map((e) => createEdgeChange(e.id, e.predicateIri, e.sourceId, e.targetId, 'add')));
		}

		return new PatchGraphMonad(state).bindMany(bindings);
	};
}

function createNewNode(
	nodeIri: string,
	variant: NodeVariantInternal,
	symbolNodeRef?: GraphNode
): GraphNode | PredicateNode {
	if (variant === 'predicate') {
		return {
			id: nodeIri,
			type: 'node',
			variant: 'predicate',
			edgeIds: [],
			props: [],
		};
	} else if (variant === 'connector') {
		if (!symbolNodeRef) {
			console.error('Connector node added without symbolnoderef, entering bad state');
		}
		return {
			id: nodeIri,
			type: 'node',
			variant: 'connector',
			props: [],
			symbolNodeRef: symbolNodeRef as GraphNode,
		};
	} else {
		return {
			id: nodeIri,
			type: 'node',
			variant: variant,
			props: [],
		};
	}
}

// Ignoring IRI objects when adding props except for connectorId which should be treated as a property
// before applying custom rule
function isEdgePatch(rdfPatch: RdfPatch) {
	const isIri = rdfPatch.data.object.termType !== 'Literal';
	const isSpecialProp = !! directPropKeys.find(directKey => directPropConfig[directKey].iri === rdfPatch.data.predicate.id);
	return isIri && !isSpecialProp;
}

function isPropPatch(rdfPatch: RdfPatch) {
	return !isEdgePatch(rdfPatch);
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
