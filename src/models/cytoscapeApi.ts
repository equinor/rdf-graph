import cytoscape, { ElementDefinition } from 'cytoscape';
import { DataFactory, Quad } from 'n3';
import { nanoid } from 'nanoid';
import { getPredicateMapping } from '../mapper/predicates';
import { Pair, RdfEdgeDefinition, RdfNodeDataDefinition, RdfNodeDefinition } from './cytoscapeApi.types';
import { partition } from '../utils/partition';

const { namedNode, literal, quad } = DataFactory;

export const createEdge = (q: Quad): RdfEdgeDefinition => {
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

export const getAllQuads = (data: RdfNodeDataDefinition) =>
	new Array<Quad>()
		.concat(data.rdfIncoming.map((pair) => quad(namedNode(data.id), namedNode(pair.key), namedNode(pair.value))))
		.concat(data.rdfOutgoing.map((pair) => quad(namedNode(data.id), namedNode(pair.key), namedNode(pair.value))))
		.concat(data.rdfParents.map((pair) => quad(namedNode(data.id), namedNode(pair.key), namedNode(pair.value))))
		.concat(data.rdfChildren.map((pair) => quad(namedNode(data.id), namedNode(pair.key), namedNode(pair.value))))
		.concat(data.rdfData.map((pair) => quad(namedNode(data.id), namedNode(pair.key), literal(pair.value))));

export const getNode = (id: string, cy: cytoscape.Core) => {
	return cy.nodes(`node${createSelector('id', id)}`)[0];
};

export const getNodeData = (id: string, cy: cytoscape.Core) => {
	const node = getNode(id, cy);
	if (!node) {
		throw new Error(`Unable to find node with id=${id}`);
	}
	const data = node.data();
	if (!isValidRdfNodeData(data)) {
		throw new Error(`Unable to cast ${JSON.stringify(data)} to RdfNodeDefinition`);
	}

	return data as RdfNodeDataDefinition;
};

export const updateNodeData = (id: string, data: RdfNodeDataDefinition, cy: cytoscape.Core) => {
	const node = getNode(id, cy);
	if (!node) {
		throw new Error(`Unable to find node with id=${id}`);
	}
	node.data(data);
};

/**
 * Make sure all rdfData is reflected in cytoscapes inner data objects
 * like image, color, label etc.
 */
export const syncNodeData = (id: string, cy: cytoscape.Core) => {
	const node = getNode(id, cy);
	if (!node) {
		throw new Error(`Unable to find node with id=${id}`);
	}
	const oldData = getNodeData(id, cy);

	getPredicateMapping().forEach((predicate) => {
		const predicateIri = predicate.key;
		const predicateCytoscapeKey = predicate.value;

		const pair = oldData.rdfData.find((p) => p.key === predicateIri);
		if (pair) {
			node.data(predicateCytoscapeKey, pair.value);
		} else {
			node.removeData(predicateCytoscapeKey);
		}
	});
};

export const getSyncedNodeData = (data: RdfNodeDataDefinition) => {
	let syncedData = JSON.parse(JSON.stringify(data));
	getPredicateMapping().flatMap((predicate) => {
		const predicateIri = predicate.key;
		const predicateCytoscapeKey = predicate.value;

		const pair = data.rdfData.find((p) => p.key === predicateIri);
		if (pair) {
			syncedData[predicateCytoscapeKey] = pair.value;
		}
	});
	return syncedData;
};

export const removeData = (quads: Quad[], cy: cytoscape.Core) => {
	const subject2Pairs = quads.reduce((acc, q) => {
		const index = q.subject.value;
		if (index !== undefined) {
			if (!acc[index]) {
				acc[index] = [];
			}
			acc[index].push({ key: q.predicate.value, value: q.object.value });
		}
		return acc;
	}, {} as { [key: string]: Pair[] });

	Object.keys(subject2Pairs).forEach((subject) => {
		const node = getNode(subject, cy);
		if (!node) {
			throw new Error(`Unable to find node with id=${subject}`);
		}
		const oldData = getNodeData(subject, cy);

		const predicates = quads.map((q) => q.predicate.value);

		const newRdfData = oldData.rdfData.filter((oldPair) => !predicates.includes(oldPair.key));
		const newRdfParent = oldData.rdfParents.filter((oldPair) => !predicates.includes(oldPair.key));
		const newRdfChildren = oldData.rdfChildren.filter((oldPair) => !predicates.includes(oldPair.key));
		const newRdfIncoming = oldData.rdfIncoming.filter((oldPair) => !predicates.includes(oldPair.key));
		const newRdfOutgoing = oldData.rdfOutgoing.filter((oldPair) => !predicates.includes(oldPair.key));

		node.data('rdfData', newRdfData);
		node.data('rdfParent', newRdfParent);
		node.data('rdfChildren', newRdfChildren);
		node.data('rdfIncoming', newRdfIncoming);
		node.data('rdfOutgoing', newRdfOutgoing);
	});
};

export const deleteEmpty = (nodeIds: string[], cy: cytoscape.Core) => {
	nodeIds.forEach((nodeId) => {
		const node = getNode(nodeId, cy);
		if (node) {
			const data = getNodeData(nodeId, cy);
			if (allRdfData(data).length === 0) {
				cy.remove(node);
			}
		}
	});
};

export const getNodesAndEdges = (elements: ElementDefinition[]) => {
	const [nodes, edges] = partition((e) => isValidRdfNodeData(e.data), elements);
	const invalid = edges.filter((e) => !isValidRdfEdgeData(e.data));
	if (invalid.length !== 0) {
		throw new Error(`${invalid.length} elements are neither valid rdfNodes or rdfEdges, for example element with id ${invalid[0].data.id}`);
	}

	return { nodes: nodes.map((n) => n as RdfNodeDefinition), edges: edges.map((e) => e as RdfEdgeDefinition) };
};

export const isValidRdfNodeData = (data: any): boolean =>
	data.id && data.rdfData && data.rdfChildren && data.rdfParents && data.rdfIncoming && data.rdfOutgoing;

export const isValidRdfEdgeData = (data: any): boolean => data.id && data.rdfSubject && data.rdfPredicate && data.rdfObject;

const allRdfData = (data: RdfNodeDataDefinition) =>
	new Array<Pair>().concat(data.rdfData).concat(data.rdfChildren).concat(data.rdfParents).concat(data.rdfIncoming).concat(data.rdfOutgoing);

const createSelector = (key: string, value: string) => {
	return `[${key}='${value}']`;
};
