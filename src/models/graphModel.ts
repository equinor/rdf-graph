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
type GraphNodeProperties = {
	[index: string]: string | number;
};
export type GraphNodeIdentifier = GraphNodeBase & GraphNodeType;

export type GraphNode = GraphNodeIdentifier & {
	refCount: number;
} & GraphNodeProperties;

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

export type GraphPropertyIdentifier = GraphNodeBase & {
	type: 'property';
	key: string;
	value: GraphNodeProperties['index'];
};

export type GraphAssertion =
	| {
			action: 'add';
			assertion: GraphEdge | GraphNode | GraphPropertyIdentifier;
	  }
	| {
			action: 'remove';
			assertion: GraphEdgeIdentifier | GraphNodeIdentifier | GraphPropertyIdentifier;
	  };
export type GraphPatch = Iterable<GraphAssertion>;
export type GraphState = {
	nodeIndex: Map<string, GraphNode>;
	linkIndex: Map<string, GraphEdge>;
};
