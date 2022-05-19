import { ElementDefinition } from 'cytoscape';
import { Quad } from 'n3';
import { nanoid } from 'nanoid';
import { rdfObjectKey, rdfPredicateKey, rdfSubjectKey } from '../components/sparqlGraph/cytoscapeDataKeys';
import { short } from '../utils';

export type Transformation = (quad: Quad) => ElementDefinition[];

export const postProcessSvgTag = 'postProcessSvg';

export const defaultTransformation = ({ subject, predicate, object }: Quad) => {
	let edgeElement: ElementDefinition = {
		data: {
			source: subject.value,
			target: object.value,
			id: nanoid(),
			label: short(predicate.value),
			[rdfSubjectKey]: subject.value,
			[rdfPredicateKey]: predicate.value,
			[rdfObjectKey]: object.value,
		},
	};

	return [{ data: { id: subject.value } }, { data: { id: object.value } }, edgeElement];
};

export const createPropertyTransform = (cyKey: string): Transformation => {
	const transformation = ({ subject, object }: Quad): ElementDefinition[] => {
		let node: ElementDefinition = { data: { id: subject.value } };
		node.data[cyKey] = object.value;
		return [node];
	};
	return transformation;
};

export const tagSubject = (tag: string, value: boolean | string = true): Transformation => {
	const transformation = ({ subject }: Quad): ElementDefinition[] => {
		let node: ElementDefinition = { data: { id: subject.value } };
		node.data[tag] = value;
		return [node];
	};
	return transformation;
};

export const parentTransform = ({ subject, object }: Quad): ElementDefinition[] => {
	return [
		{
			data: {
				id: object.value,
				parent: subject.value,
			},
		},
	];
};

export const hasChildrenTransform = ({ subject, object }: Quad): ElementDefinition[] => {
	return [
		{
			data: {
				id: object.value,
				parent: subject.value,
			},
		},
	];
};
