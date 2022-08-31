import { Quad, termFromId, termToId, Writer, DataFactory } from 'n3';
import { RdfAssertion, RdfPatch2 } from '../types';
import {
	GraphEdge,
	GraphState,
	GraphNode,
	GraphAssertion,
	EdgeAssertion,
	PropertyAssertion,
	GraphMetadata,
	AbstractNode,
	GraphConnector,
} from '../types/graphModel';
import { GraphStateProps } from './GraphStateProps';
import {
	colorKey,
	labelKey,
	compoundNodeKey,
	connectorKey,
	rotationKey,
	hasSvgIri,
	rotationIri,
	hasConnectorIri,
	hasConnectorSuffixIri,
	labelIri,
	colorIri,
	compoundNodeIri,
	simpleSymbolKey,
	hasSimpleSymbolIri,
	nodeTemplateKey,
	hasNodeTemplateIri,
	directionKey,
	hasDirectionIri,
	typeIri,
} from '../mapper/predicates';

import { getSymbol, Point } from '../../symbol-api';
import { flat, flatMap, unique } from '../utils/iteratorUtils';

const writer = new Writer();
const quadToString = ({ subject, predicate, object, graph }: Quad) => writer.quadToString(subject, predicate, object, graph);

const initAN = () => ({
	incoming: new Map<string, GraphEdge[]>(),
	outgoing: new Map<string, GraphEdge[]>(),
	properties: new Map<string, string[]>(),
});
const initM = () => ({ ...initAN(), edges: new Map<string, GraphEdge[]>() });
const refCount = (node: AbstractNode) =>
	[node.incoming.size, node.outgoing.size, node.properties.size, (node as GraphMetadata).edges?.size || 0].reduce((a, n) => a + n);

function add<T>(index: Map<string, T[]>, key: string, value: T) {
	if (index.has(key)) index.get(key)!.push(value);
	else index.set(key, [value]);
}
function removeElement<T>(array: T[], element: T) {
	if (!array) {
		debugger;
	}
	const idx = array.indexOf(element);

	if (idx < 0) debugger;
	array.splice(idx, 1);
}
function removeElementId<T, K extends keyof T>(array: T[], prop: K, id: T[K]) {
	const index = array.findIndex((e) => e[prop] === id);

	if (index < 0) debugger;
	array.splice(index, 1);
}
function remove<T>(index: Map<string, T[]>, key: string, value: T) {
	const arr = index.get(key)!;

	removeElement(arr, value);
	if (arr.length === 0) index.delete(key);
}
function removeId<T, K extends keyof T>(index: Map<string, T[]>, key: string, prop: K, id: T[K]) {
	const arr = index.get(key)!;

	removeElementId(arr, prop, id);
	if (arr.length === 0) index.delete(key);
}

const dataProps = [
	'symbolName',
	'symbol',
	'relativePosition',
	'connectorName',
	'node',
	labelKey,
	colorKey,
	rotationKey,
	simpleSymbolKey,
	nodeTemplateKey,
	directionKey,
] as const;
const nodeProps = [compoundNodeKey, connectorKey] as const;
type ValueProp = typeof dataProps[number];
type NodeProp = typeof nodeProps[number];
type Dep = [...NodeProp[], NodeProp | ValueProp];

const propertyDependents: { [index in NodeProp | ValueProp]: Dep[] } = {
	symbolName: [['symbol']],
	[rotationKey]: [['symbol']],
	symbol: [[connectorKey, 'relativePosition']],
	connectorName: [[`relativePosition`]],
	relativePosition: [],
	[connectorKey]: [[connectorKey, 'relativePosition']],
	[compoundNodeKey]: [],
	node: [['relativePosition']],
	[labelKey]: [],
	[colorKey]: [],
	[simpleSymbolKey]: [],
	[nodeTemplateKey]: [],
	[directionKey]: [],
};
const predicate2prop: { [index: string]: NodeProp | ValueProp } = {
	[hasSvgIri]: 'symbolName',
	[rotationIri]: rotationKey,
	[hasConnectorSuffixIri]: 'connectorName',
	[hasConnectorIri]: connectorKey,
	[labelIri]: labelKey,
	[colorIri]: colorKey,
	[hasSimpleSymbolIri]: simpleSymbolKey,
	[hasNodeTemplateIri]: nodeTemplateKey,
	[hasDirectionIri]: directionKey,
};

const edgePredicate2prop: { [index: string]: ValueProp } = {
	[labelIri]: labelKey,
	[colorIri]: colorKey,
};

function* propagator(a: AbstractNode, prop: NodeProp | ValueProp) {
	for (const dep of propertyDependents[prop]) {
		let queue = [...dep];
		let currNode: AbstractNode | AbstractNode[] = a;
		let currDep = queue.shift()!;
		while (queue.length > 0) {
			if (Array.isArray(currNode)) {
				// eslint-disable-next-line no-loop-func
				currNode = currNode.map((n) => n[currDep]).filter((n) => n);
			} else {
				currNode = currNode[currDep] as AbstractNode;
			}
			currDep = queue.shift()!;
		}
		if (!currNode) continue;
		if (Array.isArray(currNode)) {
			for (const n of currNode) {
				yield* propInvalidations[currDep](n);
			}
		} else yield* propInvalidations[currDep](currNode);
	}
}

function invalidator(prop: NodeProp | ValueProp, accessor: string | ((g: AbstractNode) => any)) {
	return function* (a: AbstractNode): Iterable<PropertyAssertion> {
		const declared = typeof accessor === 'string' ? (a.properties.get(accessor) || [undefined])[0] : accessor(a);
		const prev = a[prop];
		if (declared === prev) return;
		if (prev) yield { action: 'remove', assertion: { type: 'property', target: a, key: prop, value: prev } };
		a[prop] = declared;
		if (declared) yield { action: 'add', assertion: { type: 'property', target: a, key: prop, value: declared } };
		yield* propagator(a, prop);
	};
}
const propInvalidations: { [index in NodeProp | ValueProp]: (node: AbstractNode) => Iterable<PropertyAssertion> } = {
	[labelKey]: invalidator(labelKey, labelIri),
	[colorKey]: invalidator(colorKey, colorIri),
	symbolName: invalidator('symbolName', hasSvgIri),
	//[simpleShapeKey]: invalidator(simpleShapeKey, hasSimpleSymbolIri),
	[rotationKey]: invalidator(rotationKey, ({ properties }) =>
		properties.has(rotationIri) ? parseInt(properties.get(rotationIri)![0]) : undefined
	),
	symbol: invalidator('symbol', (g) => (g['symbolName'] ? getSymbol(g['symbolName'], { rotation: g[rotationKey] }) : undefined)),
	connectorName: invalidator('connectorName', hasConnectorSuffixIri),
	relativePosition: invalidator('relativePosition', ({ type, node, connectorName }) => {
		if (type !== 'connector' || !node || !connectorName || !node.symbol) return undefined;
		const c = node.symbol.connectors.find(({ id }) => id === connectorName);
		return c?.point || new Point(0, 0);
	}),
	[directionKey]: invalidator(directionKey, hasDirectionIri),
	[simpleSymbolKey]: invalidator(simpleSymbolKey, hasSimpleSymbolIri),
	[nodeTemplateKey]: invalidator(nodeTemplateKey, hasNodeTemplateIri),
	node: (g: AbstractNode) => propagator(g, 'node'),
	[connectorKey]: (g: AbstractNode) => propagator(g, connectorKey),
	[compoundNodeKey]: function* (g: AbstractNode) {
		const declared = (g.outgoing.get(compoundNodeIri) || [undefined])[0] as GraphNode | undefined;
		const prev = g.parent;

		if (declared === prev) return;
		if (prev) yield { action: 'remove', assertion: { type: 'property', target: g, key: compoundNodeKey, value: prev } };

		g.parent = declared;

		if (declared) yield { action: 'add', assertion: { type: 'property', target: g, key: compoundNodeKey, value: g.parent } };
		yield* propagator(g, compoundNodeKey);
	},
};

const dependentQuads = (n: AbstractNode) =>
	unique(
		(function* (n: AbstractNode) {
			for (const [iri, vals] of n.properties.entries())
				for (const l of vals) yield new Quad(termFromId(n.id, DataFactory), termFromId(iri, DataFactory), DataFactory.literal(l));
			for (const val of n.outgoing.values())
				for (const { origin } of val)
					if ('termType' in origin) yield origin;
					else yield origin.origin;
			for (const val of n.incoming.values())
				for (const { origin } of val)
					if ('termType' in origin) yield origin;
					else yield origin.origin;
		})(n)
	);

function* changeNodeType(s: GraphState, n: AbstractNode, type: AbstractNode['type']) {
	// re-entrancy check, dont change type on other nodes or it could become turtles all the way down
	if (n.type === type) return;
	if ((s as any).__changingNodeType__) return;
	(s as any).__changingNodeType__ = true;

	// fetch sub-graph directly connected to this node
	const quads = [...dependentQuads(n)];

	// seed node-cache with changed node
	const nodeCache = new Map<string, AbstractNode>();
	// disconnect the node completely (remove properties, incoming/outgoing edges and lastly the node itself)
	yield* flatMap(quads, (q) => graphAssertion(s, { action: 'remove', assertion: q } as RdfAssertion, nodeCache));

	// the ol' switcharoo
	n.type = type;
	switch (type) {
		case 'node':
			delete n.edges;
			delete n.node;
			break;
		case 'connector':
			delete n.edges;
			break;
		case 'metadata':
			n.edges = n.edges || new Map();
			delete n.node;
			break;
	}

	// re-insert node and all dependent edges/properties
	yield* flatMap(quads, (q) => graphAssertion(s, { action: 'add', assertion: q } as RdfAssertion, nodeCache));

	delete (s as any).__changingNodeType__;
}

function* graphAssertion<M extends GraphState>(
	state: M,
	{ assertion, action }: RdfAssertion,
	nodeCache?: Map<string, AbstractNode>
): Iterable<GraphAssertion> {
	const q = assertion;
	let sNode: AbstractNode, pNode: AbstractNode, oNode: AbstractNode;
	const sTerm = termToId(q.subject);
	const pTerm = termToId(q.predicate);
	const isConnectorPredicate = pTerm === hasConnectorIri;
	const oTerm = q.object.termType !== 'Literal' ? termToId(q.object) : false;

	switch (action) {
		case 'add':
			// Subject
			if (!state.nodeIndex.has(sTerm)) {
				sNode = nodeCache?.get(sTerm) || { type: 'node', id: sTerm, ...initAN() };
				state.nodeIndex.set(sTerm, sNode);
				if (sNode.type !== 'metadata') {
					yield { action: 'add', assertion: sNode };
				}
			} else {
				//Handle existing predicate...
				sNode = state.nodeIndex.get(sTerm)!;
			}
			// Object literal
			if (!oTerm) {
				add(sNode.properties, pTerm, q.object.value);
				if (sNode.type === 'metadata') {
					if (edgePredicate2prop.hasOwnProperty(pTerm)) {
						const edges = flat(sNode.edges.values());
						for (const edge of edges) {
							yield {
								action: 'add',
								assertion: { type: 'property', key: edgePredicate2prop[pTerm], value: q.object.value, target: edge },
							};
						}
					} else {
						console.warn(
							`${sTerm} is used as predicate before and subject now, but ${pTerm} is an unknown predicate, triple will be ignored.`
						);
					}
				} else if (predicate2prop.hasOwnProperty(pTerm)) {
					yield* propInvalidations[predicate2prop[pTerm] as ValueProp](sNode);
				}
				return;
			}

			// Object IRI
			if (!state.nodeIndex.has(oTerm)) {
				switch (pTerm) {
					case hasConnectorIri:
						oNode = nodeCache?.get(oTerm) || ({ id: oTerm, type: 'connector', node: sNode, ...initAN() } as GraphConnector);
						yield { action: 'add', assertion: oNode };
						break;
					case typeIri:
						oNode = nodeCache?.get(oTerm) || ({ id: oTerm, type: 'metadata', ...initM() } as GraphMetadata);
						break;
					default:
						oNode = nodeCache?.get(oTerm) || ({ id: oTerm, type: 'node', ...initAN() } as GraphNode);
						yield { action: 'add', assertion: oNode };
						break;
				}
				state.nodeIndex.set(oTerm, oNode);
			} else {
				oNode = state.nodeIndex.get(oTerm)!;

				switch (pTerm) {
					case hasConnectorIri:
						oNode.node = sNode;
						yield* changeNodeType(state, oNode, 'connector');
						break;
					case typeIri:
						yield* changeNodeType(state, oNode, 'metadata');
						break;
				}
			}

			type EdgeProps = {
				key: string;
				value: string;
			};
			let newEdgeProperties: EdgeProps[] = [];
			// Predicate
			if (!state.nodeIndex.has(pTerm)) {
				pNode = (nodeCache?.get(pTerm) as GraphMetadata) || { id: pTerm, type: 'metadata', ...initM() };
				state.nodeIndex.set(pTerm, pNode);
			} else {
				const p = state.nodeIndex.get(pTerm)!;
				if (p.type === 'metadata') {
					pNode = p;
				} else {
					yield* changeNodeType(state, p, 'metadata');
					pNode = p as any as GraphMetadata;
				}
				// store properties from old node (maybe just converted metadata node) in newEdgeProperties so they can be yielded later
				for (const prop of pNode.properties.keys()) {
					if (edgePredicate2prop.hasOwnProperty(prop)) {
						const values = pNode.properties.get(prop);
						if (values) {
							for (const value of values) {
								newEdgeProperties.push({ key: edgePredicate2prop[prop], value });
							}
						}
					}
				}
			}

			let edge: GraphEdge = {
				id: quadToString(q),
				metadata: pNode,
				type: 'edge',
				source: sTerm,
				sourceRef: sNode,
				target: oTerm,
				targetRef: oNode,
				origin: assertion,
			};
			// Populate incoming/outgoing collections,
			// in order to preserve RDF/property-graph correspondence
			add(sNode.outgoing, pTerm, edge);
			add(oNode.incoming, pTerm, edge);
			add(pNode.edges, edge.id, edge);

			if (isConnectorPredicate) {
				// not part of visual edges, populate connector-array in lieu of yielding a GraphEdge
				sNode[connectorKey] = sNode[connectorKey] || [];
				sNode[connectorKey]!.push(oNode as GraphConnector);
			} else if (pTerm === typeIri) {
				// not part of visual edges, for now do nothing more than keep in property-graph
			} else if (sNode.type === 'metadata') {
				console.warn(
					`${sTerm} is used as predicate before and subject now, but ${oTerm} is an IRI, only literals allowed when using predicates as subject, triple will be ignored.`
				);
			} else if (sNode.type === 'connector' || oNode.type === 'connector') {
				// source and|or target node is a connector, track and yield an edge hooked up to connectors
				let sc: Partial<GraphEdge>, tc: Partial<GraphEdge>;
				let source: AbstractNode, target: AbstractNode;

				if (sNode.type === 'connector') {
					sc = { source: sNode.node.id, sourceRef: sNode.node, sourceConnector: sNode.id, sourceConnectorRef: sNode };
					source = sNode.node;
				} else {
					sc = { source: sNode.id, sourceRef: sNode };
					source = sNode;
				}
				if (oNode.type === 'connector') {
					tc = { target: oNode.node.id, targetRef: oNode.node, targetConnector: oNode.id, targetConnectorRef: oNode };
					target = oNode.node;
				} else {
					tc = { target: oNode.id, targetRef: oNode };
					target = oNode;
				}
				const connectorEdge = { ...edge, ...sc, ...tc, origin: edge };

				add(source.outgoing, pTerm, connectorEdge);
				add(target.incoming, pTerm, connectorEdge);
				add(pNode.edges, connectorEdge.id, connectorEdge);
				state.linkIndex.set(connectorEdge.id, connectorEdge);

				const connectorEdgeAssertion: EdgeAssertion = { action: 'add', assertion: connectorEdge };
				yield connectorEdgeAssertion;
				for (const prop of newEdgeProperties) {
					yield { action: 'add', assertion: { type: 'property', key: prop.key, value: prop.value, target: connectorEdge } };
				}
			} else {
				// regular edge, no connectors. Track and yield.
				state.linkIndex.set(edge.id, edge);

				const edgeAssertion: EdgeAssertion = { action: 'add', assertion: edge };
				yield edgeAssertion;
				for (const prop of newEdgeProperties) {
					yield { action: 'add', assertion: { type: 'property', key: prop.key, value: prop.value, target: edge } };
				}
			}
			if (predicate2prop.hasOwnProperty(pTerm)) {
				// calculate dependencies (if any)
				yield* propInvalidations[predicate2prop[pTerm] as NodeProp](sNode);
			}
			break;
		case 'remove':
			sNode = state.nodeIndex.get(sTerm)!;
			pNode = state.nodeIndex.get(pTerm)! as GraphMetadata;

			if (!oTerm) {
				remove(sNode.properties, pTerm, assertion.object.value);
				if (predicate2prop.hasOwnProperty(pTerm)) {
					yield* propInvalidations[predicate2prop[pTerm] as ValueProp](sNode);
				}

				if (edgePredicate2prop.hasOwnProperty(pTerm) && sNode.type === 'metadata') {
					const edges = flat(sNode.edges.values());
					for (const edge of edges) {
						yield {
							action: 'remove',
							assertion: { type: 'property', key: edgePredicate2prop[pTerm], value: q.object.value, target: edge },
						};
					}
				}
			} else {
				oNode = state.nodeIndex.get(oTerm)!;
				const edgeId = quadToString(q);
				removeId(sNode.outgoing, pTerm, 'target', oTerm);
				removeId(oNode.incoming, pTerm, 'source', sTerm);
				pNode.edges.delete(edgeId);

				if (isConnectorPredicate) {
					// sNode.
					removeElement(sNode[connectorKey]!, oNode);
					if (oNode.type === 'connector' && (oNode.incoming.get(hasConnectorIri) || []).length < 1) {
						yield* changeNodeType(state, oNode, 'node');
					}
				} else if (pTerm === typeIri) {
				} else {
					const edge = state.linkIndex.get(edgeId)!;

					state.linkIndex.delete(edgeId);
					if ('type' in edge.origin && edge.origin.type === 'edge') {
						let source: AbstractNode, target: AbstractNode;

						if (sNode.type === 'connector') source = sNode.node;
						else source = sNode;
						if (oNode.type === 'connector') target = oNode.node;
						else target = oNode;

						remove(source.outgoing, pTerm, edge);
						remove(target.incoming, pTerm, edge);
					}

					for (const prop of pNode.properties.keys()) {
						if (edgePredicate2prop.hasOwnProperty(prop)) {
							const values = pNode.properties.get(prop);
							if (values) {
								for (const value of values) {
									yield { action: 'remove', assertion: { type: 'property', key: prop, value: value, target: edge } };
								}
							}
						}
					}
					const edgeAssertion: EdgeAssertion = { action: 'remove', assertion: edge };
					yield edgeAssertion;
				}

				if (predicate2prop.hasOwnProperty(pTerm)) {
					yield* propInvalidations[predicate2prop[pTerm] as NodeProp](sNode);
				}

				if (refCount(oNode) < 1) {
					state.nodeIndex.delete(oTerm);
					nodeCache?.set(oNode.id, oNode);
					yield { action: 'remove', assertion: oNode };
				}

				if (refCount(pNode) < 1) {
					state.nodeIndex.delete(pTerm);
					nodeCache?.set(pNode.id, pNode);
				} else if (pNode.edges.size < 1) {
					yield* changeNodeType(state, pNode, 'node');
				}
			}

			if (refCount(sNode) < 1) {
				state.nodeIndex.delete(sTerm);
				nodeCache?.set(sNode.id, sNode);
				if (sNode.type !== 'metadata') {
					yield { action: 'remove', assertion: sNode };
				}
			}

			break;
	}
}

export function patchGraph<M extends GraphState, P extends RdfPatch2>(state: M, patch: P): GraphStateProps {
	return { graphState: state, graphPatch: flatMap(patch, (p) => graphAssertion(state, p)) };
}
