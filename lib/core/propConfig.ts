// PROPERTY CONFIGURATION

import { addProp } from './baseGraphOperations';
import { BindFunction, PatchGraphMonad } from './PatchGraphMonad';
import {
	DerivedPropKey,
	GraphNode,
	DirectPropKey,
	PatchGraphResult,
	DerivedProp,
} from './types/core';
import { UiSymbolProvider, UiSymbol } from './types/UiSymbol';

export type RuleInputs = { nodeIri: string; symbolProvider?: UiSymbolProvider };

export type PropRule = (target: RuleInputs) => BindFunction;

export type DirectPropConfig = {
	iri: string;
	rule?: PropRule;
};

export type DerivedPropConfig = {
	rule: PropRule;
};

export const directPropConfig: Record<DirectPropKey, DirectPropConfig> = {
	symbolId: {
		iri: 'http://rdf.equinor.com/ui/hasEngineeringSymbol',
		rule: (ruleInputs: RuleInputs) => derivedPropConfig['symbol'].rule(ruleInputs),
	},
	connectorIds: {
		iri: 'http://rdf.equinor.com/ui/hasConnector',
	},
	connectorName: {
		iri: 'http://rdf.equinor.com/ui/hasConnectorName',
	},
	rotation: {
		iri: 'http://rdf.equinor.com/ui/hasRotation',
	},
	fill: {
		iri: 'http://rdf.equinor.com/ui/fill',
	},
	stroke: {
		iri: 'http://rdf.equinor.com/ui/stroke',
	},
	label: {
		iri: 'http://www.w3.org/2000/01/rdf-schema#label',
	},
	description: {
		iri: 'http://rdf.equinor.com/ui/description',
	},
	group: {
		iri: 'http://rdf.equinor.com/ui/partOfGroup',
	},
} as const;

export const directPropKeys = Object.keys(directPropConfig) as DirectPropKey[];

export const derivedPropConfig: Record<DerivedPropKey, DerivedPropConfig> = {
	symbol: {
		rule: ({ nodeIri, symbolProvider }: RuleInputs) => {
			return (state: PatchGraphResult) => {
				const store = state.graphState.nodeStore;
				const node = store[nodeIri];
				const symbolId = findSingleDirectProp(node, 'symbolId');
				const rotationString = findSingleDirectProp(node, 'rotation');
				let symbol = undefined;
				if (symbolId) {
					const rotation = rotationString ? parseInt(rotationString) : undefined;
					symbol = symbolProvider ? symbolProvider(symbolId, rotation) : undefined;
				}

				if (!symbol) {
					console.warn(`Symbol with id=${symbolId} not found!`);
					return new PatchGraphMonad(state);
				}

				const newProp: DerivedProp = { key: 'symbol', type: 'derived', value: symbol };

				const connectorIds = findManyDirectProp(node, 'connectorIds');
				const downstreamRules = connectorIds.flatMap((ci) => [
					derivedPropConfig['connectorDirection'].rule({ nodeIri: ci }),
					derivedPropConfig['connectorRelativePosition'].rule({ nodeIri: ci }),
				]);

				return new PatchGraphMonad(state).bindMany(
					[addProp(node, newProp)].concat(downstreamRules)
				);
			};
		},
	},

	connectorDirection: {
		rule: ({ nodeIri }: RuleInputs) => {
			return (state: PatchGraphResult) => {
				const store = state.graphState.nodeStore;
				const connectorNode = store[nodeIri];
				const connectorInfo = getConnectorInfo(connectorNode);

				if (!connectorInfo?.direction) {
					console.warn(`Expected UiSymbol instance on node`, nodeIri);
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
		rule: ({ nodeIri }: RuleInputs) => {
			return (state: PatchGraphResult) => {
				const store = state.graphState.nodeStore;
				const connectorNode = store[nodeIri];
				const connectorInfo = getConnectorInfo(connectorNode);

				if (!connectorInfo?.position) {
					console.warn(`Expected UiSymbol instance on node`, nodeIri);
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

/**  */
function getConnectorInfo(connectorNode: GraphNode) {
	if (connectorNode.variant !== 'connector') {
		console.warn(`Expected node with id ${connectorNode.id} to be a connector`);
		return undefined;
	}

	const symbol = findDerivedProp<UiSymbol>(connectorNode.symbolNodeRef, 'symbol');
	return symbol?.connectors.find(
		(c) => c.id === findSingleDirectProp(connectorNode, 'connectorName')
	);
}
