import { ElementDefinition } from 'cytoscape';
import { nanoid } from 'nanoid';
import { rdfObjectKey, rdfPredicateKey, rdfSubjectKey } from '../components/sparqlGraph/cytoscapeDataKeys';
import { RdfTriple } from '../models';
import { short } from '../utils';

export type Transformation = (triple: RdfTriple) => ElementDefinition[];

export const postProcessSvgTag = 'postProcessSvg';

export const defaultTransformation = (triple: RdfTriple) => {
	const { rdfSubject, rdfPredicate, rdfObject } = triple;
	let edgeElement: ElementDefinition = {
		data: {
			source: triple.rdfSubject,
			target: triple.rdfObject,
			id: nanoid(),
			label: short(triple.rdfPredicate),
			[rdfSubjectKey]: rdfSubject,
			[rdfPredicateKey]: rdfPredicate,
			[rdfObjectKey]: rdfObject,
		},
	};

	return [{ data: { id: rdfSubject } }, { data: { id: rdfObject } }, edgeElement];
};

export const createPropertyTransform = (cyKey: string): Transformation => {
	const transformation = (triple: RdfTriple): ElementDefinition[] => {
		const { rdfSubject, rdfObject } = triple;
		let node: ElementDefinition = { data: { id: rdfSubject } };
		node.data[cyKey] = rdfObject;
		return [node];
	};
	return transformation;
};

export const tagSubject = (tag: string, value: boolean | string = true): Transformation => {
	const transformation = (triple: RdfTriple): ElementDefinition[] => {
		let node: ElementDefinition = { data: { id: triple.rdfSubject } };
		node.data[tag] = value;
		return [node];
	};
	return transformation;
};

export const parentTransform = (triple: RdfTriple): ElementDefinition[] => {
	return [
		{
			data: {
				id: triple.rdfObject, //HasConnector means object is connector
				parent: triple.rdfSubject, //HasConnector means subject is the node that will have an svg
			},
		},
	];
};

export const hasChildrenTransform = (triple: RdfTriple): ElementDefinition[] => {
	return [
		{
			data: {
				id: triple.rdfObject, //HasConnector means object is connector
				parent: triple.rdfSubject, //HasConnector means subject is the node that will have an svg
			},
		},
	];
};
