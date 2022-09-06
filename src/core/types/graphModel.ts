import { Quad } from 'n3';
import { Point, UiNodeSymbol } from '../ui/uiApplyPatch';

type ElementId = string;
export type GraphElementBase = {
	id: ElementId;
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
	symbol?: UiNodeSymbol;
	relativePosition?: Point;
	connectorName?: string;
	parent?: GraphNode;
	symbolName?: string;
	rotation?: number;
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
	id: ElementId;
	source: ElementId;
	target: ElementId;
	sourceRef: AbstractNode;
	targetRef: AbstractNode;
	sourceConnector?: ElementId;
	targetConnector?: ElementId;
	sourceConnectorRef?: GraphConnector;
	targetConnectorRef?: GraphConnector;
	metadata: GraphMetadata;
	origin: Quad | GraphEdge;
} & GraphVisualProps;

export type GraphPropertyTarget = AbstractNode | GraphEdge;

export type GraphProperty<TTarget extends GraphPropertyTarget> = {
	type: 'property';
	target: TTarget;
	key: string;
	value: any;
};

type AssertionBase = { action: 'add' | 'remove' };
export type EdgeAssertion = AssertionBase & { assertion: GraphEdge };
// export type NodeAssertion = AssertionBase & { assertion: GraphNode };
// export type ConnectorAssertion = AssertionBase & { assertion: GraphConnector };
export type PropertyAssertion = AssertionBase & { assertion: GraphProperty<GraphPropertyTarget> };

export type Assertion<T> = AssertionBase & { assertion: T };
export type GraphAssertion = Assertion<GraphEdge | GraphNode | GraphConnector | GraphMetadata | GraphProperty<GraphPropertyTarget>>;
export type GraphPatch = Iterable<GraphAssertion>;
export type GraphState = {
	nodeIndex: Map<string, AbstractNode>;
	linkIndex: Map<string, GraphEdge>;
};

export type GraphSelection = Array<AbstractNode | GraphEdge>;

export type SelectionCallback = (selection: GraphSelection) => Assertion<GraphProperty<GraphPropertyTarget>>[];
