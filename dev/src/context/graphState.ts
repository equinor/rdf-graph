import { GraphEdge, GraphNode, KnownProps } from '@rdf-graph/types/types';

type EdgeN = GraphEdge & {
	data: Record<string, string>;
	props: KnownProps;
};

export type GState = {
	nodes: GraphNode[];
	edges: [];
};
