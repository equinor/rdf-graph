import { DataFactory } from 'n3';
import { Pairs } from '../models/cytoscapeApi.types';
import { isUri } from '../utils/isUri';
import { TwoWayMap } from '../utils/twoWayDictionary';

const { namedNode } = DataFactory;

const compoundNodeIri = 'http://rdf.equinor.com/ui/parent';
const labelIri = 'http://www.w3.org/2000/01/rdf-schema#label';
const colorIri = 'http://rdf.equinor.com/ui/color';
const hasConnectorIri = 'http://rdf.equinor.com/ui/hasConnector';
const hasSvgIri = 'http://rdf.equinor.com/ui/hasSvg';
const hasConnectorSuffixIri = 'http://rdf.equinor.com/ui/hasConnectorSuffix';
const rotationIri = 'http://rdf.equinor.com/ui/rotation';

// keys linked to predicates
export const compoundNodeKey = 'parent';
export const labelKey = 'label';
export const colorKey = 'color';
export const hasSvgKey = 'image';
export const rotationKey = 'rotation';

export const compoundNodePredicate = namedNode(compoundNodeIri);
export const labelPredicate = namedNode(labelIri);
export const colorPredicate = namedNode(colorIri);
export const hasConnectorPredicate = namedNode(hasConnectorIri);
export const hasSvgPredicate = namedNode(hasSvgIri);
export const hasConnectorSuffixPredicate = namedNode(hasConnectorSuffixIri);
export const rotationPredicate = namedNode(rotationIri);

const dict: { [key: string]: string } = {
	[compoundNodeIri]: compoundNodeKey,
	[labelIri]: labelKey,
	[colorIri]: colorKey,
	[hasSvgIri]: hasSvgKey,
	[rotationIri]: rotationKey,
};

//keys for cytoscape management
export const nodeTypeKey = 'nodeType';
export const layoutIgnoreKey = 'layoutIgnore';
export const idKey = 'id';
export const cytoscapeKeys = [nodeTypeKey, layoutIgnoreKey, idKey];

export const parentPredicates = [compoundNodeIri];
export const childPredicates = [hasConnectorIri];

const iri2dataKey = new TwoWayMap(dict);

export const isDataKey = (predicate: { value: string }) => {
	return iri2dataKey.includes(predicate.value);
};

export const getDataKey = (predicate: { value: string }) => {
	return iri2dataKey.get(predicate.value);
};

export const getPredicateMapping = (): Pairs => {
	return Object.keys(dict).map((key) => {
		return { key, value: dict[key] };
	});
};

export const isHierarchyPredicate = (predicate: string) => parentPredicates.concat(childPredicates).includes(predicate);
