import { Quad } from 'n3';
import { NodeType } from '../models/nodeType';
import { mergeElementsByKey } from './mergeElements';
import {
	colorPredicate,
	compoundNodePredicate,
	hasConnectorPredicate,
	hasConnectorSuffixPredicate,
	hasSvgPredicate,
	labelPredicate,
	rotationPredicate,
} from './predicates';
import {
	createPropertyTransform,
	edgeTransformation,
	Transformation,
	hasChildrenTransform,
	parentTransform,
	tagSubject,
	postProcessSvgTag,
	literalDataTransform,
} from './transformations';

export const rdfTriples2Elements = (triples: Quad[]) => {
	const predicate2Transformation: { [key: string]: Transformation[] } = {
		[compoundNodePredicate.value]: [parentTransform],
		[labelPredicate.value]: [createPropertyTransform('label')],
		[colorPredicate.value]: [createPropertyTransform('color')],
		[hasSvgPredicate.value]: [
			createPropertyTransform('symbolId'),
			tagSubject(postProcessSvgTag),
			tagSubject('nodeType', NodeType.SymbolContainer),
		],
		[rotationPredicate.value]: [
			createPropertyTransform('rotation'),
			tagSubject(postProcessSvgTag),
			tagSubject('nodeType', NodeType.SymbolContainer),
		],
		[hasConnectorPredicate.value]: [hasChildrenTransform, createPropertyTransform('hasConnector')],
		[hasConnectorSuffixPredicate.value]: [
			createPropertyTransform('connectorId'),
			tagSubject('nodeType', NodeType.SymbolConnector),
			tagSubject('layoutIgnore', true),
			tagSubject('ignore', true), // created only for data, actual connectors created in post process
		],
	};

	const elements = triples.flatMap((triple) =>
		(predicate2Transformation[triple.predicate.value] ?? [edgeTransformation])
			.concat(literalDataTransform)
			.flatMap((transform) => transform(triple))
	);

	console.log('got elements ', elements);
	return mergeElementsByKey(elements);
};
