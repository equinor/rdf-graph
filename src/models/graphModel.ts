import { Quad } from 'n3';
import { NodeSymbol, Point, SymbolRotation } from '../symbol-api';

type GraphId = string;
type GraphElementBase = {
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
};

export type GraphPropertyIdentifier = {
	type: 'property';
	node: AbstractNode | GraphEdge;
	key: string;
	value: any;
};

type GraphAssertionBase = { action: 'add' | 'remove' };
export type EdgeAssertion = GraphAssertionBase & { assertion: GraphEdge };
export type NodeAssertion = GraphAssertionBase & { assertion: GraphNode };
export type ConnectorAssertion = GraphAssertionBase & { assertion: GraphConnector };
export type PropertyAssertion = GraphAssertionBase & { assertion: GraphPropertyIdentifier };

export type GraphAssertion = GraphAssertionBase & { assertion: GraphEdge | GraphNode | GraphConnector | GraphMetadata | GraphPropertyIdentifier };
export type GraphPatch = Iterable<GraphAssertion>;
export type GraphState = {
	nodeIndex: Map<string, AbstractNode>;
	linkIndex: Map<string, GraphEdge>;
};

export type GraphSelection = Array<AbstractNode | GraphEdge>;

export type SelectionCallback = (selection: GraphSelection) => PropertyAssertion[];
