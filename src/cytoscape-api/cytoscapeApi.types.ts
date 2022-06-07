import { EdgeDataDefinition, EdgeDefinition, NodeDataDefinition, NodeDefinition } from 'cytoscape';

export type Pair = {
	key: string;
	value: string;
};

export type Pairs = Pair[];

export interface RdfNodeDataDefinition extends NodeDataDefinition {
	id: string;
	rdfData: Pairs;
	rdfChildren: Pairs;
	rdfParents: Pairs;
	rdfIncoming: Pairs;
	rdfOutgoing: Pairs;
}

export interface RdfEdgeDataDefinition extends EdgeDataDefinition {
	id: string;
	rdfSubject: string;
	rdfPredicate: string;
	rdfObject: string;
}

export interface RdfNodeDefinition extends NodeDefinition {
	data: RdfNodeDataDefinition;
}

export interface RdfEdgeDefinition extends EdgeDefinition {
	data: RdfEdgeDataDefinition;
}
