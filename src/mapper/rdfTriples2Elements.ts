import { ElementDefinition } from 'cytoscape';
import { RdfTriple } from '../models';
import {
	createPropertyTransform,
	createConnectorTransform,
	hasSvgTransform,
	defaultTransformation,
	Transformation,
	hasConnectorTransform,
} from './transformations';

const compoundNodePredicate = 'http://rdf.equinor.com/ui/parent';
const labelPredicate = 'http://www.w3.org/2000/01/rdf-schema#label';
const colorPredicate = 'http://rdf.equinor.com/ui/color';
const hasConnectorPredicate = 'http://rdf.equinor.com/ui/hasConnector';
const hasSvgPredicate = 'http://rdf.equinor.com/ui/hasSvg';
const hasConnectorSuffix = 'http://rdf.equinor.com/ui/hasConnectorSuffix';

export const rdfTriples2Elements = (triples: RdfTriple[]) => {
	const connector2Icon: { [connector: string]: string } = Object.fromEntries(
		triples
			.filter(({ rdfPredicate: type }) => type === hasConnectorPredicate)
			.map(({ rdfSubject, rdfObject }) => [rdfObject /*the connector*/, rdfSubject /*the icon*/])
	);
	const iconNode2Svg: { [iconNode: string]: string } = Object.fromEntries(
		triples
			.filter(({ rdfPredicate: type }) => type === hasSvgPredicate)
			.map(({ rdfSubject, rdfObject }) => [rdfSubject /*the node that requires an image*/, rdfObject /*the svg image*/])
	);

	const predicate2Transformation: { [key: string]: Transformation } = {
		[compoundNodePredicate]: createPropertyTransform('parent'),
		[labelPredicate]: createPropertyTransform('label'),
		[colorPredicate]: createPropertyTransform('color'),
		[hasSvgPredicate]: hasSvgTransform,
		[hasConnectorPredicate]: hasConnectorTransform,
		[hasConnectorSuffix]: createConnectorTransform(connector2Icon, iconNode2Svg),
	};

	const elements = triples
		.flatMap((triple) => (predicate2Transformation[triple.rdfPredicate] ?? defaultTransformation)(triple))
		.reduce((acc, element) => {
			//Group by id
			const index = element.data.id!;
			if (!acc[index]) {
				acc[index] = [];
			}
			acc[index].push(element);
			return acc;
		}, {} as { [key: string]: ElementDefinition[] });

	return Object.keys(elements).map((key) => elements[key].reduce((acc, current) => mergeElements(acc, current)));
};

const mergeElements = (first: ElementDefinition, second: ElementDefinition) => {
	return { ...first, ...second, data: { ...first.data, ...second.data } };
};
