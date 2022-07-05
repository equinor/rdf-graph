import { DataFactory } from 'n3';
import { TwoWayMap } from '../utils/twoWayDictionary';

const { namedNode } = DataFactory;

export const compoundNodeIri = 'http://rdf.equinor.com/ui/parent';
export const labelIri = 'http://www.w3.org/2000/01/rdf-schema#label';
export const colorIri = 'http://rdf.equinor.com/ui/color';
export const hasConnectorIri = 'http://rdf.equinor.com/ui/hasConnector';
export const hasSvgIri = 'http://rdf.equinor.com/ui/hasSvg';
export const hasSimpleSvgIri = 'http://rdf.equinor.com/ui/hasSimpleSvg';
export const hasSimpleSymbolIri = 'http://rdf.equinor.com/ui/hasSimpleSymbol';
export const hasConnectorSuffixIri = 'http://rdf.equinor.com/ui/hasConnectorSuffix';
export const rotationIri = 'http://rdf.equinor.com/ui/rotation';

// keys linked to predicates
export const compoundNodeKey = 'parent';
export const labelKey = 'label';
export const colorKey = 'color';
export const svgKey = 'svgId';
export const simpleSvgKey = 'simpleImage';
export const simpleShapeKey = 'simpleShape';
export const rotationKey = 'rotation';
export const connectorKey = 'connector';

export const compoundNodePredicate = namedNode(compoundNodeIri);
export const labelPredicate = namedNode(labelIri);
export const colorPredicate = namedNode(colorIri);
export const hasConnectorPredicate = namedNode(hasConnectorIri);
export const hasSvgPredicate = namedNode(hasSvgIri);
export const hasSimpleSvgPredicate = namedNode(hasSimpleSvgIri);
export const hasConnectorSuffixPredicate = namedNode(hasConnectorSuffixIri);
export const rotationPredicate = namedNode(rotationIri);

const dict: { [key: string]: string } = {
	[compoundNodeIri]: compoundNodeKey,
	[labelIri]: labelKey,
	[colorIri]: colorKey,
	[hasSimpleSvgIri]: simpleSvgKey,
	[hasSvgIri]: svgKey,
	[rotationIri]: rotationKey,
	[hasConnectorSuffixIri]: connectorKey,
};

//other keys
export const imageKey = 'image';
export const imageWidthKey = 'imageWidth';
export const imageHeightKey = 'imageHeight';
export const relativePositionXKey = 'relativePositionX';
export const relativePositionYKey = 'relativePositionY';

export const parentPredicates = [compoundNodeIri];
export const childPredicates = [hasConnectorIri];

export const predicateMap = new TwoWayMap(dict);

export const isDataKey = (predicate: { value: string }) => {
	return predicateMap.includes(predicate.value);
};

export const getDataKey = (predicate: { value: string }) => {
	return predicateMap.get(predicate.value);
};

export const isHierarchyPredicate = (predicate: string) => parentPredicates.concat(childPredicates).includes(predicate);
