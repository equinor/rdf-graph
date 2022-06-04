import { DataFactory, NamedNode, Quad } from 'n3';
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

const dict = {
	[compoundNodeIri]: compoundNodeKey,
	[labelIri]: labelKey,
	[colorIri]: colorKey,
	[hasSvgIri]: hasSvgKey,
	[rotationIri]: rotationKey,
};

//keys for cytoscape management
export const nodeTypeKey = 'nodeType';
export const layoutIgnoreKey = 'layoutIgnore';
export const ignoreKey = 'ignore';
export const idKey = 'id';
export const cytoscapeKeys = [nodeTypeKey, layoutIgnoreKey, ignoreKey, idKey];

export const parentPredicates = [compoundNodeIri];
export const childPredicates = [hasConnectorIri];

const iri2dataKey = new TwoWayMap(dict);

export const isDataKey = (predicate: { value: string }) => {
	return iri2dataKey.includes(predicate.value);
};

export const getDataKey = (predicate: { value: string }) => {
	return iri2dataKey.get(predicate.value);
};

/**
 *
 * @param dataKey
 *  The cytoscape dataKey that should be used to find rdf-predicate
 * @returns
 *  - If dataKey is a known cytoscape element that corresponds to an rdf predicate, like 'label' that predicate ('http://www.w3.org/2000/01/rdf-schema#label') is returned as a n3 named node
 *  - Data is stored using full URLs so for valid URLs the dataKey itself is returned wrapped as a n3 named node
 *  - If the predicate is not a uri it must be a control predicate we use for cytoscape and undefined is returned
 *  - Unknown data keys should always be valid URLs, if they are not exception is thrown
 */
export const getPredicate = (dataKey: string) => {
	const predicate = namedNode(iri2dataKey.revGet(dataKey));

	if (predicate) {
		return predicate;
	}

	if (isUri(dataKey)) {
		return namedNode(dataKey);
	}

	if (cytoscapeKeys.includes(dataKey)) {
		return undefined;
	}

	throw new Error(`Unknown data key ${dataKey}.`);
};
