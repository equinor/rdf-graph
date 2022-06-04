import { ElementDefinition } from 'cytoscape';
import { Quad } from 'n3';
import { createDataNode, createEdge, createNodeWithChildren, createNodeWithParents } from '../models/cytoscapeElement';
import { childPredicates, isDataKey, parentPredicates } from './predicates';

export type Transformation = (quad: Quad) => ElementDefinition[];

const isDataTriple = ({ predicate, object }: Quad) => {
	return object.termType === 'Literal' || isDataKey(predicate);
};

const isEdgeTriple = (q: Quad) => {
	return !isDataTriple(q);
};

export const edgeTransformation = (q: Quad): ElementDefinition[] => (isEdgeTriple(q) ? [createEdge(q)] : []);

export const dataTransform = (q: Quad): ElementDefinition[] => (isDataTriple(q) ? [createDataNode(q)] : []);

export const parentTransform = (q: Quad): ElementDefinition[] => (parentPredicates.includes(q.predicate.value) ? [createNodeWithParents(q)] : []);

export const hasChildrenTransform = (q: Quad): ElementDefinition[] =>
	childPredicates.includes(q.predicate.value) ? [createNodeWithChildren(q)] : [];
