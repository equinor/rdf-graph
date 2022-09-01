import { Quad } from 'n3';
import { NodeSymbol, Point, SymbolRotation } from '../../symbol-api';

type GraphId = string;
export type GraphElementBase = {
	id: GraphId;
	incoming: Map<string, GraphEdge[]>;
	outgoing: Map<string, GraphEdge[]>;
	properties: Map<string, string[]>;
};
// type GraphNodeType = {
// 	type: 'node' | 'linkNode';
// };

// export type GraphNodeIdentifier = GraphNodeBase & GraphNodeType;

export type AbstractNode = GraphNode | GraphConnector | GraphMetadata;

export type GraphVisualProps = {
	symbol?: NodeSymbol;
	relativePosition?: Point;
	connectorName?: string;
	parent?: GraphNode;
	symbolName?: string;
	rotation?: SymbolRotation;
	connector?: GraphConnector[];
	[index: string]: any;
};
export type GraphNode = GraphElementBase & {
	type: 'node';
} & GraphVisualProps;

export type GraphConnector = GraphElementBase & {
	type: 'connector';
	node: GraphNode;
} & GraphVisualProps;

export type GraphMetadata = GraphElementBase & {
	type: 'metadata';
	edges: Map<string, GraphEdge[]>;
} & GraphVisualProps;

export type GraphEdge = {
	type: 'edge';
	id: GraphId;
	source: GraphId;
	target: GraphId;
	sourceRef: AbstractNode;
	targetRef: AbstractNode;
	sourceConnector?: GraphId;
	targetConnector?: GraphId;
	sourceConnectorRef?: GraphConnector;
	targetConnectorRef?: GraphConnector;
	metadata: GraphMetadata;
	origin: Quad | GraphEdge;
} & GraphVisualProps;

export type GraphProperty = {
	type: 'property';
	node: AbstractNode | GraphEdge;
	key: string;
	value: any;
};

type AssertionBase = { action: 'add' | 'remove' };
export type EdgeAssertion = AssertionBase & { assertion: GraphEdge };
// export type NodeAssertion = AssertionBase & { assertion: GraphNode };
// export type ConnectorAssertion = AssertionBase & { assertion: GraphConnector };
export type PropertyAssertion = AssertionBase & { assertion: GraphProperty };

export type Assertion<T> = AssertionBase & { assertion: T };
export type GraphAssertion = Assertion<GraphEdge | GraphNode | GraphConnector | GraphMetadata | GraphProperty>;
export type GraphPatch = Iterable<GraphAssertion>;
export type GraphState = {
	nodeIndex: Map<string, AbstractNode>;
	linkIndex: Map<string, GraphEdge>;
};

export type GraphSelection = Array<AbstractNode | GraphEdge>;

export type SelectionCallback = (selection: GraphSelection) => Assertion<GraphProperty>[];
