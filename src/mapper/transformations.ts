import { ElementDefinition } from 'cytoscape';
import { nanoid } from 'nanoid';
import { rdfObjectKey, rdfPredicateKey, rdfSubjectKey } from '../components/sparqlGraph/cytoscapeDataKeys';
import { RdfTriple } from '../models';
import { short } from '../utils';

export type Transformation = (triple: RdfTriple) => ElementDefinition[];

export const postProcessSvgTag = 'postProcessSvg';

export const defaultTransformation = ({ rdfSubject, rdfPredicate, rdfObject }: RdfTriple) => {
	let edgeElement: ElementDefinition = {
		data: {
			source: rdfSubject,
			target: rdfObject,
			id: nanoid(),
			label: short(rdfPredicate),
			[rdfSubjectKey]: rdfSubject,
			[rdfPredicateKey]: rdfPredicate,
			[rdfObjectKey]: rdfObject,
		},
	};

	return [{ data: { id: rdfSubject } }, { data: { id: rdfObject } }, edgeElement];
};

export const createPropertyTransform = (cyKey: string): Transformation => {
	const transformation = ({ rdfSubject, rdfObject }: RdfTriple): ElementDefinition[] => {
		let node: ElementDefinition = { data: { id: rdfSubject } };
		node.data[cyKey] = rdfObject;
		return [node];
	};
	return transformation;
};

export const tagSubject = (tag: string, value: boolean | string = true): Transformation => {
	const transformation = ({ rdfSubject }: RdfTriple): ElementDefinition[] => {
		let node: ElementDefinition = { data: { id: rdfSubject } };
		node.data[tag] = value;
		return [node];
	};
	return transformation;
};

export const parentTransform = ({ rdfSubject, rdfObject }: RdfTriple): ElementDefinition[] => {
	return [
		{
			data: {
				id: rdfObject,
				parent: rdfSubject,
			},
		},
	];
};

export const hasChildrenTransform = ({ rdfSubject, rdfObject }: RdfTriple): ElementDefinition[] => {
	return [
		{
			data: {
				id: rdfObject,
				parent: rdfSubject,
			},
		},
	];
};
