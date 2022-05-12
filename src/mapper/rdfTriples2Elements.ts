import cytoscape, { ElementDefinition } from 'cytoscape';
import { RdfTriple } from '../models';
import { NodeType } from '../models/nodeType';
import { partition } from '../utils/partition';
import { groupElementsByKey, mergeElementsByKey } from './mergeElements';
import { createSvgTransformation } from './postTransformations';
import {
	createPropertyTransform,
	defaultTransformation,
	Transformation,
	hasChildrenTransform,
	parentTransform,
	tagSubject,
	postProcessSvgTag,
} from './transformations';

const compoundNodePredicate = 'http://rdf.equinor.com/ui/parent';
const labelPredicate = 'http://www.w3.org/2000/01/rdf-schema#label';
const colorPredicate = 'http://rdf.equinor.com/ui/color';
const hasConnectorPredicate = 'http://rdf.equinor.com/ui/hasConnector';
const hasSvgPredicate = 'http://rdf.equinor.com/ui/hasSvg';
const hasConnectorSuffix = 'http://rdf.equinor.com/ui/hasConnectorSuffix';
const rotationPredicate = 'http://rdf.equinor.com/ui/rotation';

export const rdfTriples2Elements = (triples: RdfTriple[]) => {
	const predicate2Transformation: { [key: string]: Transformation[] } = {
		[compoundNodePredicate]: [parentTransform],
		[labelPredicate]: [createPropertyTransform('label')],
		[colorPredicate]: [createPropertyTransform('color')],
		[hasSvgPredicate]: [createPropertyTransform('symbolId'), tagSubject(postProcessSvgTag), tagSubject('nodeType', NodeType.SymbolContainer)],
		[rotationPredicate]: [createPropertyTransform('rotation'), tagSubject(postProcessSvgTag), tagSubject('nodeType', NodeType.SymbolContainer)],
		[hasConnectorPredicate]: [hasChildrenTransform, createPropertyTransform('hasConnector')],
		[hasConnectorSuffix]: [
			createPropertyTransform('connectorId'),
			tagSubject('nodeType', NodeType.SymbolConnector),
			tagSubject('layoutIgnore', true),
			tagSubject('ignore', true), // created only for data, actual connectors created in post process
		],
	};

	const elements = triples.flatMap((triple) =>
		(predicate2Transformation[triple.rdfPredicate] ?? [defaultTransformation]).flatMap((transform) => transform(triple))
	);
	return mergeElementsByKey(elements);
};
export const postProcessElements = (elements: ElementDefinition[]) => {
	const iconNode2Connectors = groupElementsByKey(
		elements.filter((e) => e.data.nodeType === NodeType.SymbolConnector),
		'parent'
	);
	const svgTransform = createSvgTransformation(iconNode2Connectors).transformNew;
	const [postProcess, noPostProcess] = partition((e) => e.data[postProcessSvgTag], elements);

	return noPostProcess.filter((e) => !e.data.ignore).concat(postProcess.flatMap((e) => svgTransform(e)));
};

export const postUpdateElements = (elements: ElementDefinition[], cy: cytoscape.Core) => {
	const iconNode2Connectors = groupElementsByKey(
		elements.filter((e) => e.data.nodeType === NodeType.SymbolConnector),
		'parent'
	);
	const svgTransform = createSvgTransformation(iconNode2Connectors).transformUpdate;

	elements.forEach((newElement) => {
		const oldElement = cy.elements(`[id = "${newElement.data.id}"]`)[0];
		if (oldElement) {
			Object.keys(newElement.data).forEach((key) => {
				oldElement.data(key, newElement.data[key]);
			});
			newElement.data.ignore = true;
		}
	});

	const [postProcess, noPostProcess] = partition((e) => e.data[postProcessSvgTag], elements);
	postProcess.forEach((e) => svgTransform(e, cy));
	noPostProcess.filter((e) => !e.data.ignore).forEach((e) => cy.add(e));
};
