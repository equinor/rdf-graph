import { ElementDefinition } from 'cytoscape';
import { Quad } from 'n3';
import {
	createDataNode,
	createEdge,
	createNodeWithChildren,
	createNodeWithIncomingEdge,
	createNodeWithOutgoingEdge,
	createNodeWithParents,
} from '../cytoscape-api/cytoscapeApi';
import { childPredicates, isDataKey, parentPredicates } from '../mapper/predicates';

export type Transformation = (quad: Quad) => ElementDefinition[];

const isDataTriple = ({ predicate, object }: Quad) => {
	return object.termType === 'Literal' || isDataKey(predicate);
};

const isEdgeTriple = (q: Quad) => {
	return !isDataTriple(q) && !isChildTriple(q) && !isParentTriple(q);
};

const isParentTriple = (q: Quad) => {
	return parentPredicates.includes(q.predicate.value);
};

const isChildTriple = (q: Quad) => {
	return childPredicates.includes(q.predicate.value);
};

export const edgeTransformation = (q: Quad): ElementDefinition[] =>
	isEdgeTriple(q) ? [createEdge(q), createNodeWithIncomingEdge(q), createNodeWithOutgoingEdge(q)] : [];

export const dataTransform = (q: Quad): ElementDefinition[] => (isDataTriple(q) ? [createDataNode(q)] : []);

export const parentTransform = (q: Quad): ElementDefinition[] => (parentPredicates.includes(q.predicate.value) ? [createNodeWithParents(q)] : []);

export const hasChildrenTransform = (q: Quad): ElementDefinition[] =>
	childPredicates.includes(q.predicate.value) ? [createNodeWithChildren(q)] : [];
