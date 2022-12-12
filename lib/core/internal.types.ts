import { BasicProps, GraphElement, GraphPatch, GraphProperty, GraphState, NodeProp } from "./types"

const predicates = [
    'http://rdf.equinor.com/ui/hasConnector',
    'http://rdf.equinor.com/ui/hasConnectorName',
    'http://rdf.equinor.com/ui/hasConnectorSymbol',
    'http://rdf.equinor.com/ui/hasParent',
    'http://www.w3.org/2000/01/rdf-schema#label',
    'http://rdf.equinor.com/ui/fill'
] as const;

export type PredicateIri = typeof predicates[number];

export type PredicateRule = (subject: GraphElement) => [GraphPatch[], GraphState];

const propertyDependents: { [index in NodeProp | ValueProp]: Dep[] } = {
	symbolName: [[symbolKey]],
	[rotationKey]: [[symbolKey]],
	symbol: [
		[connectorKey, connectorDirectionKey],
		[connectorKey, connectorRelativePositionKey],
	],
	connectorName: [[connectorDirectionKey], [connectorRelativePositionKey]],
	connectorDirection: [],
	connectorRelativePosition: [],
	[connectorKey]: [
		[connectorKey, connectorDirectionKey],
		[connectorKey, connectorRelativePositionKey],
	],
	[parentKey]: [],
	[labelKey]: [],
	[colorKey]: [],
	[simpleSymbolKey]: [],
	[nodeTemplateKey]: [],
	[directionKey]: [],
};