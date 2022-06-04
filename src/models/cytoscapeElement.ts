import { Quad } from 'n3';
import { nanoid } from 'nanoid';
import { Pairs, RdfEdgeDataDefinition, RdfEdgeDefinition, RdfNodeDataDefinition, RdfNodeDefinition } from './cytoscapeExtensions.types';

class RdfNodeData implements RdfNodeDataDefinition {
	id: string;
	rdfData: Pairs;
	rdfChildren: Pairs;
	rdfParents: Pairs;

	constructor(id: string, rdfData: Pairs = [], rdfChildren: Pairs = [], rdfParents: Pairs = []) {
		this.id = id;
		this.rdfData = rdfData;
		this.rdfChildren = rdfChildren;
		this.rdfParents = rdfParents;
	}
}

class RdfEdgeData implements RdfEdgeDataDefinition {
	source: string;
	target: string;
	id: string;
	rdfSubject: string;
	rdfPredicate: string;
	rdfObject: string;

	constructor(q: Quad) {
		this.source = q.subject.value;
		this.target = q.object.value;
		this.id = nanoid();
		this.rdfSubject = q.subject.value;
		this.rdfPredicate = q.predicate.value;
		this.rdfObject = q.object.value;
	}
}

export const createEdge = (q: Quad): RdfEdgeDefinition => {
	return {
		data: new RdfEdgeData(q),
	};
};

export const createDataNode = (q: Quad): RdfNodeDefinition => {
	return {
		data: new RdfNodeData(q.subject.value, [{ key: q.predicate.value, value: q.object.value }], [], []),
	};
};

export const createNodeWithChildren = (q: Quad): RdfNodeDefinition => {
	return {
		data: new RdfNodeData(q.subject.value, [], [{ key: q.predicate.value, value: q.object.value }], []),
	};
};

export const createNodeWithParents = (q: Quad): RdfNodeDefinition => {
	return {
		data: new RdfNodeData(q.subject.value, [], [], [{ key: q.predicate.value, value: q.object.value }]),
	};
};

export const getData = (node: RdfNodeDefinition, predicate: string) => {
	return node.data.rdfData.find((d) => d.key === predicate)?.value;
};

export const getChildren = (node: RdfNodeDefinition, predicate: string) => {
	return node.data.rdfChildren.filter((c) => c.key === predicate).map((pair) => pair.value);
};

export const getParents = (node: RdfNodeDefinition, predicate: string) => {
	return node.data.rdfParents.filter((c) => c.key === predicate).map((pair) => pair.value);
};
