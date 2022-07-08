import { Quad, termFromId, termToId, Writer, DataFactory, Term } from 'n3';
import { RdfAssertion, RdfPatch2 } from '../../models';
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
} from '../../models/graphModel';
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
} from '../../mapper/predicates';
import { getSymbol, Point } from '../../symbol-api';
import { setEquals } from '../../utils/setEquals';

const writer = new Writer();
const quadToString = ({ subject, predicate, object, graph }: Quad) => writer.quadToString(subject, predicate, object, graph);

const initAN = () => ({
	incoming: new Map<string, GraphNode[]>(),
	outgoing: new Map<string, GraphNode[]>(),
	properties: new Map<string, string[]>(),
});
const initM = () => ({ ...initAN(), edges: [] as GraphEdge[] });
const refCount = (node: AbstractNode) =>
	[node.incoming.size, node.outgoing.size, node.properties.size, (node as GraphMetadata).edges?.length || 0].reduce((a, n) => a + n);

function add<T>(index: Map<string, T[]>, key: string, value: T) {
	if (index.has(key)) index.get(key)!.push(value);
	else index.set(key, [value]);
}
function removeElement<T>(array: T[], element: T) {
	array.splice(array.indexOf(element), 1);
}
function remove<T>(index: Map<string, T[]>, key: string, value: T) {
	const arr = index.get(key)!;
	removeElement(arr, value);
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
function* propagator(a: AbstractNode, prop: NodeProp | ValueProp) {
	for (const dep of propertyDependents[prop]) {
		let queue = [...dep];
		let currNode: AbstractNode | AbstractNode[] = a;
		let currDep = queue.shift()!;
		while (queue.length > 0) {
			if (Array.isArray(currNode)) {
				// TODO ask Eirik about this
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
		if (prev) yield { action: 'remove', assertion: { type: 'property', node: a, key: prop, value: prev } };
		a[prop] = declared;
		if (declared) yield { action: 'add', assertion: { type: 'property', node: a, key: prop, value: declared } };
		yield* propagator(a, prop);
	};
}
const propInvalidations: { [index in NodeProp | ValueProp]: (node: AbstractNode) => Iterable<PropertyAssertion> } = {
	[labelKey]: invalidator(labelKey, labelIri),
	[colorKey]: invalidator(colorKey, colorIri),
	symbolName: invalidator('symbolName', hasSvgIri),
	//[simpleShapeKey]: invalidator(simpleShapeKey, hasSimpleSymbolIri),
	[rotationKey]: invalidator(rotationKey, (g) => (g.properties.has(rotationIri) ? parseInt(g.properties.get(rotationIri)![0]) : undefined)),
	symbol: invalidator('symbol', (g) => (g['symbolName'] ? getSymbol(g['symbolName'], { rotation: g[rotationKey] }) : undefined)),
	connectorName: invalidator('connectorName', hasConnectorSuffixIri),
	relativePosition: invalidator('relativePosition', (g) => {
		if (g.type !== 'connector' || !g.node) return undefined;
		if (!g.connectorName || !g.node.symbol) return new Point(0, 0);
		const c = g.node.symbol.connectors.find((x) => x.id === g.connectorName);
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
		if (prev) yield { action: 'remove', assertion: { type: 'property', node: g, key: compoundNodeKey, value: prev } };
		g.parent = declared;
		if (declared) yield { action: 'add', assertion: { type: 'property', node: g, key: compoundNodeKey, value: g.parent } };
		yield* propagator(g, compoundNodeKey);
	},
};

function* dependentQuads(n: AbstractNode) {
	for (const [iri, vals] of n.properties.entries())
		for (const l of vals) yield new Quad(termFromId(n.id, DataFactory), termFromId(iri, DataFactory), DataFactory.literal(l));
	for (const [iri, val] of n.outgoing.entries())
		for (const nn of val) yield new Quad(...([n.id, iri, nn.id].map((x) => termFromId(x, DataFactory)) as [Term, Term, Term]));
	for (const [iri, val] of n.incoming.entries())
		for (const nn of val) yield new Quad(...([nn.id, iri, n.id].map((x) => termFromId(x, DataFactory)) as [Term, Term, Term]));
}
function* flatMap<T, R>(i: Iterable<T>, c: (a: T) => Iterable<R>) {
	for (const e of i) yield* c(e);
}
function* changeNodeType(s: GraphState, n: AbstractNode, type: AbstractNode['type']) {
	// re-entrancy check, dont change type on other nodes or it could become turtles all the way down
	console.log('CHANGING ', n.id, n.type, type);
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
	switch (n.type) {
		case 'node':
			delete n.edges;
			delete n.node;
			break;
		case 'connector':
			delete n.edges;
			break;
		case 'metadata':
			n.edges = n.edges || [];
			delete n.node;
			break;
	}

	// re-insert node and all dependent edges/properties
	yield* flatMap(quads, (q) => graphAssertion(s, { action: 'add', assertion: q } as RdfAssertion, nodeCache));

	delete (s as any).__changingNodeType__;
}
function* graphAssertion<M extends GraphState>(state: M, p: RdfAssertion, nodeCache?: Map<string, AbstractNode>): Iterable<GraphAssertion> {
	const q = p.assertion;
	let sNode: AbstractNode, pNode: GraphMetadata, oNode: AbstractNode;
	const sTerm = termToId(q.subject);
	const pTerm = termToId(q.predicate);
	const isConnectorPredicate = pTerm === hasConnectorIri;
	const oTerm = q.object.termType !== 'Literal' ? termToId(q.object) : false;

	switch (p.action) {
		case 'add':
			// Subject
			if (!state.nodeIndex.has(sTerm)) {
				sNode = nodeCache?.get(sTerm) || { type: 'node', id: sTerm, ...initAN() };
				state.nodeIndex.set(sTerm, sNode);
				console.log('Yielding subject node', sNode.id);
				yield { action: 'add', assertion: sNode };
			} else {
				sNode = state.nodeIndex.get(sTerm)!;
			}
			// Object literal
			if (!oTerm) {
				add(sNode.properties, pTerm, q.object.value);

				if (predicate2prop.hasOwnProperty(pTerm)) {
					yield* propInvalidations[predicate2prop[pTerm] as ValueProp](sNode);
				}
				return;
			}
			// Predicate
			if (!state.nodeIndex.has(pTerm)) {
				pNode = (nodeCache?.get(pTerm) as GraphMetadata) || { id: pTerm, type: 'metadata', ...initM() };
				state.nodeIndex.set(pTerm, pNode);
				yield { action: 'add', assertion: pNode };
			} else {
				const p = state.nodeIndex.get(pTerm)!;
				if (p.type === 'metadata') {
					pNode = p;
				} else {
					pNode = p as any as GraphMetadata;
					yield* changeNodeType(state, p, 'metadata');
				}
			}

			// Object IRI
			if (!state.nodeIndex.has(oTerm)) {
				switch (pTerm) {
					case hasConnectorIri:
						oNode = nodeCache?.get(oTerm) || ({ id: oTerm, type: 'connector', node: sNode, ...initAN() } as GraphConnector);
						break;
					case typeIri:
						oNode = nodeCache?.get(oTerm) || ({ id: oTerm, type: 'metadata', ...initM() } as GraphMetadata);
						break;
					default:
						oNode = nodeCache?.get(oTerm) || ({ id: oTerm, type: 'node', ...initAN() } as GraphNode);
						break;
				}
				state.nodeIndex.set(oTerm, oNode);
				console.log('Yielding object node', oNode.id);

				yield { action: 'add', assertion: oNode };
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
			add(sNode.outgoing, pTerm, oNode);
			add(oNode.incoming, pTerm, sNode);

			if (isConnectorPredicate) {
				sNode[connectorKey] = sNode[connectorKey] || [];
				sNode[connectorKey]!.push(oNode as GraphConnector);
			} else if (pTerm === typeIri) {
			} else {
				console.log('TYPE', sNode.type, oNode.type);
				const sc =
					sNode.type === 'connector'
						? { source: sNode.node.id, sourceRef: sNode.node, sourceConnector: sNode.id, sourceConnectorRef: sNode }
						: { source: sNode.id, sourceRef: sNode };
				const tc =
					oNode.type === 'connector'
						? { target: oNode.node.id, targetRef: oNode.node, targetConnector: oNode.id, targetConnectorRef: oNode }
						: { target: oNode.id, targetRef: oNode };
				const linkId = quadToString(q);
				const addLink: GraphEdge = {
					id: linkId,
					metadata: pNode,
					type: 'edge',
					...sc,
					...tc,
				};

				pNode.edges.push(addLink);
				state.linkIndex.set(linkId, addLink);
				const edgeAssertion: EdgeAssertion = { action: 'add', assertion: addLink };
				yield edgeAssertion;
			}

			if (predicate2prop.hasOwnProperty(pTerm)) {
				yield* propInvalidations[predicate2prop[pTerm] as NodeProp](sNode);
			}
			break;
		case 'remove':
			sNode = state.nodeIndex.get(sTerm)!;
			pNode = state.nodeIndex.get(pTerm)! as GraphMetadata;
			if (!oTerm) {
				remove(sNode.properties, pTerm, p.assertion.object.value);
				if (predicate2prop.hasOwnProperty(pTerm)) {
					yield* propInvalidations[predicate2prop[pTerm] as ValueProp](sNode);
				}
			} else {
				oNode = state.nodeIndex.get(oTerm)!;

				remove(sNode.outgoing, pTerm, oNode);
				remove(oNode.incoming, pTerm, sNode);

				if (isConnectorPredicate) {
					removeElement(sNode[connectorKey]!, oNode);
					yield { action: 'remove', assertion: { type: 'property', node: sNode, key: connectorKey, value: oNode } };
					if (oNode.type === 'connector' && (oNode.incoming.get(hasConnectorIri) || []).length < 1) {
						yield* changeNodeType(state, oNode, 'node');
					}
					if ((oNode.incoming.get(hasConnectorIri) || []).length > 0) {
						oNode.node = oNode.incoming.get(hasConnectorIri)![0];
						yield* changeNodeType(state, oNode, 'connector');
					}
				} else if (pTerm === typeIri) {
				} else {
					const delLinkId = quadToString(q);
					const delLink = state.linkIndex.get(delLinkId)!;
					state.linkIndex.delete(delLinkId);
					removeElement(pNode.edges, delLink);

					const edgeAssertion: EdgeAssertion = { action: 'remove', assertion: delLink };
					yield edgeAssertion;
				}

				if (predicate2prop.hasOwnProperty(pTerm)) {
					yield* propInvalidations[predicate2prop[pTerm] as NodeProp](sNode);
				}
				if (refCount(oNode) < 1) {
					state.nodeIndex.delete(oTerm);
					nodeCache?.set(oNode.id, oNode);
					yield { action: 'remove', assertion: oNode };
					if (refCount(pNode) < 1) {
						state.nodeIndex.delete(pTerm);
						nodeCache?.set(pNode.id, pNode);
						yield { action: 'remove', assertion: pNode };
					} else if (pNode.edges.length < 1) {
						yield* changeNodeType(state, pNode, 'node');
					}
				}
				if (refCount(sNode) < 1) {
					state.nodeIndex.delete(sTerm);
					nodeCache?.set(sNode.id, sNode);
					console.log('refCount: ', refCount(sNode), sNode.id);

					yield { action: 'remove', assertion: sNode };
				}

				break;
			}
	}
}

export function patchGraph<M extends GraphState, P extends RdfPatch2>(state: M, patch: P): GraphStateProps {
	// const graphPatch: GraphAssertion[] = [];
	// for (const p of patch) {
	// 	graphPatch.push(...graphAssertion(state, p));
	// }
	return { graphState: state, graphPatch: flatMap(patch, (p) => graphAssertion(state, p)) };
}
