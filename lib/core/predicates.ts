//const uiBaseIri = 'http://rdf.equinor.com/ui/';

type Prop = {
	key: string;
	predicate: string;
	iri: string;
};

export const PROPS: Record<string, Prop> = {
	connector: {
		key: 'connector',
		predicate: 'hasConnector',
		iri: 'http://rdf.equinor.com/ui/hasConnector',
	},
	connectorName: {
		key: 'connectorName',
		predicate: 'hasConnectorName',
		iri: 'http://rdf.equinor.com/ui/hasConnectorName',
	},
	connectorSymbol: {
		key: 'connectorSymbol',
		predicate: 'hasConnectorSymbol',
		iri: 'http://rdf.equinor.com/ui/hasConnectorSymbol',
	},
	parent: {
		key: 'parent',
		predicate: 'hasParent',
		iri: 'http://rdf.equinor.com/ui/hasParent',
	},
	label: {
		key: 'label',
		predicate: 'label',
		iri: 'http://www.w3.org/2000/01/rdf-schema#label',
	},
	fill: {
		key: 'fill',
		predicate: 'fill',
		iri: 'http://rdf.equinor.com/ui/fill',
	},
} as const;

const c = PROPS[0];

export const PROPERTIES = [
	{
		key: 'connector',
		predicate: 'hasConnector',
		iri: 'http://rdf.equinor.com/ui/hasConnector',
	},
	{
		key: 'connectorName',
		predicate: 'hasConnectorName',
		iri: 'http://rdf.equinor.com/ui/hasConnectorName',
	},
	{
		key: 'connectorSymbol',
		predicate: 'hasConnectorSymbol',
		iri: 'http://rdf.equinor.com/ui/hasConnectorSymbol',
	},
	{
		key: 'parent',
		predicate: 'hasParent',
		iri: 'http://rdf.equinor.com/ui/hasParent',
	},
	{
		key: 'label',
		predicate: 'label',
		iri: 'http://www.w3.org/2000/01/rdf-schema#label',
	},
	{
		key: 'fill',
		predicate: 'fill',
		iri: 'http://rdf.equinor.com/ui/fill',
	},
] as const;

type ValueProp = typeof PROPERTIES[number]['key'];

type Predicate = typeof PROPERTIES[number]['predicate'];

type Iris = typeof PROPERTIES[number]['iri'];

const COMMON_PROPS = [
	{
		key: 'label',
		predicate: 'label',
		iri: 'http://www.w3.org/2000/01/rdf-schema#label',
	},
	{
		key: 'description',
		predicate: 'description',
		iri: 'http://rdf.equinor.com/ui/description',
	},
	{
		key: 'fill',
		predicate: 'fill',
		iri: 'http://rdf.equinor.com/ui/fill',
	},
	{
		key: 'stroke',
		predicate: 'stroke',
		iri: 'http://rdf.equinor.com/ui/stroke',
	},
] as const;

type CommonPropKey = typeof COMMON_PROPS[number]['key'];
type CommonPropPred = typeof COMMON_PROPS[number]['predicate'];

type A = { [index in CommonPropKey]: string | number | boolean | undefined };

const NODE_DEF_PROPS = [
	{
		key: 'label',
		predicate: 'label',
		iri: 'http://www.w3.org/2000/01/rdf-schema#label',
	},
	{
		key: 'description',
		predicate: 'description',
		iri: 'http://rdf.equinor.com/ui/description',
	},
	{
		key: 'fill',
		predicate: 'fill',
		iri: 'http://rdf.equinor.com/ui/fill',
	},
	{
		key: 'stroke',
		predicate: 'stroke',
		iri: 'http://rdf.equinor.com/ui/stroke',
	},
] as const;

const TESTS = {
	default: {
		connector: {
			key: 'connector',
			predicate: 'hasConnector',
			iri: 'http://rdf.equinor.com/ui/hasConnector',
		},
		fill: {
			key: 'fill',
			predicate: 'fill',
			iri: 'http://rdf.equinor.com/ui/fill',
		},
	},
	connector: {
		connector: {
			key: 'connector',
			predicate: 'hasConnector',
			iri: 'http://rdf.equinor.com/ui/hasConnector',
		},
		fill: {
			key: 'fill',
			predicate: 'fill',
			iri: 'http://rdf.equinor.com/ui/fill',
		},
	},
} as const;

type hei = keyof typeof TESTS;

type nias = keyof typeof TESTS['connector'];

type nias2 = typeof TESTS['connector']['connector']['key'];

let ssss = TESTS['connector']['fill'].iri;
