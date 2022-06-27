type RdfNamedNode = `http${'s' | ''}://${string}`;
type RdfBlankNode = `_:${string}`;
type RdfVariable = `?${string}`;
type RdfSubject = RdfNamedNode | RdfVariable | RdfBlankNode;
type RdfPredicate = RdfNamedNode | RdfVariable;
// type RdfObject = RdfSubject | `"${string}"`;
// type w = " " | "";
// type RdfTriple = `<${RdfSubject}>${w}<${RdfPredicate}>${w}<${RdfObject}>${w}.`;

type GraphId = string;
type GraphNodeBase = {
	id: GraphId;
};
type GraphNodeType = {
	type: 'node' | 'linkNode';
};
// type GraphNodeProperties = {
// 	[index: string]: string | number;
// };
export type GraphNodeIdentifier = GraphNodeBase & GraphNodeType;

export type GraphNode = GraphNodeIdentifier & {
	incoming: Map<string, GraphNode[]>;
	outgoing: Map<string, GraphNode[]>;
	links: GraphEdge[];
	properties: Map<string, string[]>;
	[index: string]: any;
};

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
	value: string;
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

export type GraphSelection = Array<GraphNode | GraphEdge>;
