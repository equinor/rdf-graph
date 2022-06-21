type RdfNamedNode = `http${'s' | ''}://${string}`;
type RdfBlankNode = `_:${string}`;
type RdfVariable = `?${string}`;
type RdfSubject = RdfNamedNode | RdfVariable | RdfBlankNode;
type RdfPredicate = RdfNamedNode | RdfVariable;
// type RdfObject = RdfSubject | `"${string}"`;
// type w = " " | "";
// type RdfTriple = `<${RdfSubject}>${w}<${RdfPredicate}>${w}<${RdfObject}>${w}.`;

type GraphId = string;
type GraphNodeProperties = {
	[index: string]: string | number;
};
type GraphNodeBase = {
	id: GraphId;
};
export type GraphNode = GraphNodeBase & {
	type: 'node' | 'linkNode';
	refCount: number;
} & GraphNodeProperties;

type GraphEdgeBase = {
	id: GraphId;
	type: 'link';
};
export type GraphEdge = GraphEdgeBase & {
	source: GraphId;
	target: GraphId;
	sourceRef?: GraphNode;
	targetRef?: GraphNode;
	linkRef?: GraphNode;
};

export type GraphAssertion =
	| {
			action: 'add' | 'replace';
			assertion: GraphEdge | GraphNode | (GraphNodeBase & GraphNodeProperties & { type: 'properties' });
	  }
	| {
			action: 'remove';
			assertion: GraphEdgeBase | (GraphNodeBase & { type: 'node' }) | (GraphNodeBase & GraphNodeProperties & { type: 'properties' });
	  };
export type GraphPatch = Iterable<GraphAssertion>;
export type GraphState = {
	nodeIndex: Map<string, GraphNode>;
	linkIndex: Map<string, GraphEdge>;
};
