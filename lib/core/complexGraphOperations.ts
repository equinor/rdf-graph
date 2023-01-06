import { termToId } from 'n3';
import { nanoid } from 'nanoid';
import {
	addEdge,
	addEdgeProp,
	addEdgeToPredicateNode,
	addNode,
	addPredicateNode,
	addProp,
	deleteEdges,
	deleteNode,
	deletePredicateProp,
} from './baseGraphOperations';
import { PatchGraphOptions } from './patch';
import { BindFunction, PatchGraphMonad } from './PatchGraphMonad';
import { directPropConfig, directPropKeys, RuleInputs } from './propConfig';
import { CustomProp, DirectProp, DirectPropKey, GraphNode, NodeVariantInternal, PatchGraphResult, PredicateNode, Prop, RdfPatch, SymbolNode } from './types/core';

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
		const node = state.graphState.nodeStore[subjectIri];

		// Remove quotes
		const objectLiteral = objectTerm.slice(1, -1);
		const directKey = directPropKeys.find((k) => directPropConfig[k].iri === predicateIri);
		// NOTE: Derived props are ONLY added via prop rules!

		const key = directKey ? directKey : predicateIri;
		const index = node.props.findIndex((p) => p.key === key);
		const oldValue = node.props[index].value as string[];

		const value = index === -1 ? [objectLiteral] : [...oldValue, objectLiteral];
		const prop: Prop = directKey ? { key: directKey, type: 'direct', value} : { key: objectLiteral, type: 'custom', value}

		return new PatchGraphMonad(state).bind(addProp(node, prop)) 
	};
}

export function applyRules(
	rdfPatch: RdfPatch,
	{ symbolProvider }: Partial<PatchGraphOptions>
): BindFunction {
	return (state: PatchGraphResult) => {
		const { subjectIri, predicateIri } = getTripleAsString(rdfPatch);

		const key = directPropKeys.find((k) => directPropConfig[k].iri === predicateIri);

		if (!key) {
			return new PatchGraphMonad(state);
		}

		const config = directPropConfig[key];

		if (!config.rule) {
			return new PatchGraphMonad(state);
		}

		const store = state.graphState.nodeStore;
		const node = store[subjectIri];

		const target: RuleInputs = {
			nodeIri: node.id,
			symbolProvider: symbolProvider,
		};

		return new PatchGraphMonad(state).bind(config.rule(target));
	};
}

function yieldEdgeProps(predicateIri: string): BindFunction {
	return (state: PatchGraphResult) => {
		const graphState = state.graphState;
		const predicateStore = graphState.predicateNodeStore;

		const bindings: BindFunction[] = [];
		if (predicateIri in predicateStore) {
			const predicateNode = predicateStore[predicateIri];

			bindings.push(
				...predicateNode.props.flatMap((p) =>
					predicateNode.edgeIds.map((edgeId) => {
						const direct = p as DirectProp;
						return addEdgeProp(edgeId, direct.key, direct.value[0]);
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

		const bindings: BindFunction[] = [];
		// create bindings to delete old stuff
		bindings.push(...oldNode.props.flatMap((prop) => {
			if (prop.type === 'derived') {
				return [] // pass
			} else {
				return prop.value.map(v => deletePredicateProp(oldNode, prop, v));
			}
		}));
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
