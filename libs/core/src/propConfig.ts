// PROPERTY CONFIGURATION

import { addNode, addProp, burninatePropFromNode } from './baseGraphOperations';
import { convertNode, createNewNode } from './complexGraphOperations';
import { BindFunction, PatchGraphMonad } from './PatchGraphMonad';
import {
	DerivedPropKey,
	GraphNode,
	DirectPropKey,
	PatchGraphResult,
	DerivedProp,
	UiSymbolProvider,
	UiSymbol,
} from './types';

export type RuleInputs = {
	subjectIri: string;
	objectIri?: string;
	symbolProvider?: UiSymbolProvider;
};

export type PropRule = (target: RuleInputs) => BindFunction;

export type DirectPropConfig = {
	iri: string;
	rule?: PropRule;
};

export type DerivedPropConfig = {
	rule: PropRule;
};

export const RdfPrefix = {
	ui: 'http://rdf.equinor.com/ui/',
	rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
} as const;

export type KnownRdfPrefix = keyof typeof RdfPrefix;

export const directPropConfig: Record<DirectPropKey, DirectPropConfig> = {
	symbolId: {
		iri: RdfPrefix.ui + 'hasEngineeringSymbol',
		rule: (ruleInputs: RuleInputs) => derivedPropConfig['symbol'].rule(ruleInputs),
	},
	connectorIds: {
		iri: RdfPrefix.ui + 'hasConnector',
		rule: ({ subjectIri, objectIri }: RuleInputs) => {
			const o = objectIri as string;
			return (state: PatchGraphResult) => {
				const nodeAction =
					o in state.graphState.nodeStore
						? convertNode(o, 'connector', subjectIri)
						: addNode(createNewNode(o, 'connector', subjectIri) as GraphNode);

				return new PatchGraphMonad(state).bindMany([
					nodeAction,
					derivedPropConfig['connectorRelativePosition'].rule({ subjectIri: o }),
					derivedPropConfig['connectorDirection'].rule({ subjectIri: o }),
				]);
			};
		},
	},
	connectorName: {
		iri: RdfPrefix.ui + 'hasConnectorName',
		rule: (ruleInputs: RuleInputs) => {
			return (state: PatchGraphResult) => {
				return new PatchGraphMonad(state).bindMany([
					derivedPropConfig['connectorRelativePosition'].rule(ruleInputs),
					derivedPropConfig['connectorDirection'].rule(ruleInputs),
				]);
			};
		},
	},
	rotation: {
		iri: RdfPrefix.ui + 'hasRotation',
	},
	fill: {
		iri: RdfPrefix.ui + 'fill',
	},
	stroke: {
		iri: RdfPrefix.ui + 'stroke',
	},
	label: {
		iri: RdfPrefix.rdfs + 'label',
	},
	description: {
		iri: RdfPrefix.rdfs + 'description',
	},
	group: {
		iri: RdfPrefix.ui + 'partOfGroup',
	},
	template: {
		iri: RdfPrefix.ui + 'hasTemplate',
	},
} as const;

export const directPropKeys = Object.keys(directPropConfig) as DirectPropKey[];

export const derivedPropConfig: Record<DerivedPropKey, DerivedPropConfig> = {
	symbol: {
		rule: ({ subjectIri: nodeIri, symbolProvider }: RuleInputs) => {
			return (state: PatchGraphResult) => {
				const store = state.graphState.nodeStore;
				const node = store[nodeIri];
				const symbolId = findSingleDirectProp(node, 'symbolId');
				const rotationString = findSingleDirectProp(node, 'rotation');
				let symbol = undefined;
				if (symbolId) {
					const rotation = rotationString ? parseInt(rotationString) : undefined;
					if (symbolProvider) {
						console.log("Symbol provider exist");
					}
					else {
						console.log("SYmbol provider does not exist")
					}
					symbol = symbolProvider ? symbolProvider(symbolId, rotation) : undefined;
				}

				if (!symbol) {
					console.warn(`Symbol with id=${symbolId} not found!`);
					return new PatchGraphMonad(state);
				}

				const newProp: DerivedProp = { key: 'symbol', type: 'derived', value: symbol };

				const connectorIds = findManyDirectProp(node, 'connectorIds');
				const downstreamRules = connectorIds.flatMap((ci) => [
					derivedPropConfig['connectorDirection'].rule({ subjectIri: ci }),
					derivedPropConfig['connectorRelativePosition'].rule({ subjectIri: ci }),
				]);

				return new PatchGraphMonad(state).bindMany(
					[addProp(node, newProp)].concat(downstreamRules)
				);
			};
		},
	},

	connectorDirection: {
		rule: ({ subjectIri: nodeIri }: RuleInputs) => {
			return (state: PatchGraphResult) => {
				const store = state.graphState.nodeStore;
				const connectorNode = store[nodeIri];
				const connectorInfo = getConnectorInfo(state, connectorNode);

				const oldProp = connectorNode.props.find(
					(p) => p.type === 'derived' && p.key === 'connectorDirection'
				);

				if (!connectorInfo && oldProp) {
					// This is not a connector node anymore, but 'connectorDirection' prop is still
					// around, we delete all prop values.
					return new PatchGraphMonad(state).bind(burninatePropFromNode(connectorNode, oldProp));
				} else if (!connectorInfo) {
					// This is not a connector node anymore, just ignore...
					return new PatchGraphMonad(state);
				}

				const newProp: DerivedProp = {
					key: 'connectorDirection',
					type: 'derived',
					value: connectorInfo.direction,
				};

				return new PatchGraphMonad(state).bind(addProp(connectorNode, newProp));
			};
		},
	},

	connectorRelativePosition: {
		rule: ({ subjectIri: nodeIri }: RuleInputs) => {
			return (state: PatchGraphResult) => {
				const store = state.graphState.nodeStore;
				const connectorNode = store[nodeIri];
				const connectorInfo = getConnectorInfo(state, connectorNode);

				const oldProp = connectorNode.props.find(
					(p) => p.type === 'derived' && p.key === 'connectorRelativePosition'
				);
				if (!connectorInfo && oldProp) {
					return new PatchGraphMonad(state).bind(burninatePropFromNode(connectorNode, oldProp));
				} else if (!connectorInfo) {
					return new PatchGraphMonad(state);
				}

				const newProp: DerivedProp = {
					key: 'connectorRelativePosition',
					type: 'derived',
					value: connectorInfo.position,
				};

				return new PatchGraphMonad(state).bind(addProp(connectorNode, newProp));
			};
		},
	},
} as const;

export const derivedPropKeys = Object.keys(derivedPropConfig) as DerivedPropKey[];

function findSingleDirectProp(node: GraphNode, key: DirectPropKey) {
	const props = findManyDirectProp(node, key);
	return props.length > 0 ? props[0] : undefined;
}

function findManyDirectProp(node: GraphNode, key: DirectPropKey) {
	const prop = node.props.find((p) => p.type === 'direct' && p.key === key);
	if (prop?.value) {
		return prop?.value as string[];
	}
	return [];
}

function findDerivedProp<T>(node: GraphNode, key: DerivedPropKey): T | undefined {
	const prop = node.props.find((p) => p.key === key);
	if (!prop) {
		return undefined;
	}

	return prop.value as T;
}

function getConnectorInfo(state: PatchGraphResult, connectorNode: GraphNode) {
	if (connectorNode.variant !== 'connector') {
		return undefined;
	}
	const symbolNode = state.graphState.nodeStore[connectorNode.symbolNodeId];
	const symbol = findDerivedProp<UiSymbol>(symbolNode, 'symbol');

	return symbol?.connectors.find(
		(c) => c.id === findSingleDirectProp(connectorNode, 'connectorName')
	);
}
