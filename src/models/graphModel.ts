import { NodeSymbol, Point, SymbolRotation } from '../symbol-api';

type GraphId = string;
type GraphNodeBase = {
	id: GraphId;
};
type GraphNodeType = {
	type: 'node' | 'linkNode';
};

export type GraphNodeIdentifier = GraphNodeBase & GraphNodeType;

export type GraphVisualProps = {
	symbol?: NodeSymbol;
	relativePosition?: Point;
	connectorName?: string;
	parent?: GraphNode;
	symbolName?: string;
	rotation?: SymbolRotation;
	connector?: GraphNode[];
	shape?: string;
	label?: string;
};
export type GraphNode = GraphNodeIdentifier & {
	incoming: Map<string, GraphNode[]>;
	outgoing: Map<string, GraphNode[]>;
	links: GraphEdge[];
	properties: Map<string, string[]>;
	[index: string]: any;
} & GraphVisualProps;

export type GraphEdgeIdentifier = {
	id: GraphId;
	type: 'link';
};
export type GraphEdge = GraphEdgeIdentifier & {
	source: GraphId;
	target: GraphId;
	sourceRef?: GraphNode;
	targetRef?: GraphNode;
	linkRef?: GraphNode;
};

export type GraphPropertyIdentifier = {
	type: 'property';
	node: GraphNode;
	key: string;
	value: any;
};

type GraphAssertionBase = { action: 'add' | 'remove' };
export type EdgeAssertion = GraphAssertionBase & { assertion: GraphEdge };
export type NodeAssertion = GraphAssertionBase & { assertion: GraphNode };
export type PropertyAssertion = GraphAssertionBase & { assertion: GraphPropertyIdentifier };

export type GraphAssertion = GraphAssertionBase & { assertion: GraphEdge | GraphNode | GraphPropertyIdentifier };
export type GraphPatch = Iterable<GraphAssertion>;
export type GraphState = {
	nodeIndex: Map<string, GraphNode>;
	linkIndex: Map<string, GraphEdge>;
};

export type AbstractNode = GraphNodeIdentifier & {
	incoming: Map<string, GraphNode[]>;
	outgoing: Map<string, GraphNode[]>;
	properties: Map<string, string[]>;
};

export type AbstractEdge = {
	source: GraphId;
	target: GraphId;
	linkRef: AbstractNode;
};

export type GraphSelection = Array<AbstractNode>;

export type SelectionCallback = (selection: GraphSelection) => void;
