import { Quad } from 'n3';
import { nanoid } from 'nanoid';
import { RdfEdgeDefinition, RdfNodeDataDefinition, RdfNodeDefinition } from './cytoscapeExtensions.types';

/*class RdfNodeData implements RdfNodeDataDefinition {
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
}*/

/*
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
}*/

export const createEdge = (q: Quad): RdfEdgeDefinition => {
	console.log('CREATING edge ', q);
	return {
		data: {
			source: q.subject.value,
			target: q.object.value,
			id: nanoid(),
			rdfSubject: q.subject.value,
			rdfPredicate: q.predicate.value,
			rdfObject: q.object.value,
		},
	};
};

export const createDataNode = (q: Quad): RdfNodeDefinition => {
	return {
		data: {
			id: q.subject.value,
			rdfData: [{ key: q.predicate.value, value: q.object.value }],
			rdfChildren: [],
			rdfParents: [],
			rdfIncoming: [],
			rdfOutgoing: [],
		},
	};
};

export const createNodeWithChildren = (q: Quad): RdfNodeDefinition => {
	return {
		data: {
			id: q.subject.value,
			rdfData: [],
			rdfChildren: [{ key: q.predicate.value, value: q.object.value }],
			rdfParents: [],
			rdfIncoming: [],
			rdfOutgoing: [],
		},
	};
};

export const createNodeWithParents = (q: Quad): RdfNodeDefinition => {
	return {
		data: {
			id: q.subject.value,
			rdfData: [],
			rdfChildren: [],
			rdfParents: [{ key: q.predicate.value, value: q.object.value }],
			rdfIncoming: [],
			rdfOutgoing: [],
		},
	};
};

export const createNodeWithIncomingEdge = (q: Quad): RdfNodeDefinition => {
	return {
		data: {
			id: q.object.value,
			rdfData: [],
			rdfChildren: [],
			rdfParents: [],
			rdfIncoming: [{ key: q.predicate.value, value: q.subject.value }],
			rdfOutgoing: [],
		},
	};
};

export const createNodeWithOutgoingEdge = (q: Quad): RdfNodeDefinition => {
	return {
		data: {
			id: q.subject.value,
			rdfData: [],
			rdfChildren: [],
			rdfParents: [],
			rdfIncoming: [],
			rdfOutgoing: [{ key: q.predicate.value, value: q.object.value }],
		},
	};
};

export const getDataFromElement = (node: RdfNodeDefinition, predicate: string) => {
	return node.data.rdfData.find((d) => d.key === predicate)?.value;
};

export const getData = (data: RdfNodeDataDefinition, predicate: string) => {
	return data.rdfData.find((d) => d.key === predicate)?.value;
};

export const getChildren = (node: RdfNodeDefinition, predicate: string) => {
	return node.data.rdfChildren.filter((c) => c.key === predicate).map((pair) => pair.value);
};

export const getParents = (node: RdfNodeDefinition, predicate: string) => {
	return node.data.rdfParents.filter((c) => c.key === predicate).map((pair) => pair.value);
};
