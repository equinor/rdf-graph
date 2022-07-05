import { Quad, termToId, Writer } from 'n3';
import { RdfPatch2 } from '../../models';
import { GraphEdge, GraphState, GraphNode, GraphAssertion, EdgeAssertion, PropertyAssertion } from '../../models/graphModel';
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
	simpleShapeKey,
	hasSimpleSymbolIri,
} from '../../mapper/predicates';
import { getSymbol, Point } from '../../symbol-api';
import { setEquals } from '../../utils/setEquals';

const writer = new Writer();
const quadToString = ({ subject, predicate, object, graph }: Quad) => writer.quadToString(subject, predicate, object, graph);

const initG = () => ({
	incoming: new Map<string, GraphNode[]>(),
	outgoing: new Map<string, GraphNode[]>(),
	properties: new Map<string, string[]>(),
	links: [] as GraphEdge[],
});
const refCount = (node: GraphNode) => [node.incoming.size, node.outgoing.size, node.properties.size, node.links.length].reduce((a, n) => a + n);

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

const dataProps = ['symbolName', 'symbol', 'relativePosition', 'connectorName', simpleShapeKey, labelKey, colorKey, rotationKey] as const;
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
	[connectorKey]: [[connectorKey, compoundNodeKey]],
	[compoundNodeKey]: [['relativePosition']],
	[labelKey]: [],
	[colorKey]: [],
	[simpleShapeKey]: [],
};
const predicate2prop: { [index: string]: NodeProp | ValueProp } = {
	[hasSvgIri]: 'symbolName',
	[rotationIri]: rotationKey,
	[hasConnectorSuffixIri]: 'connectorName',
	[hasConnectorIri]: connectorKey,
	[labelIri]: labelKey,
	[colorIri]: colorKey,
	[hasSimpleSymbolIri]: simpleShapeKey,
};
function* propagator(a: GraphNode, prop: NodeProp | ValueProp) {
	for (const dep of propertyDependents[prop]) {
		let queue = [...dep];
		let currNode: GraphNode | GraphNode[] = a;
		let currDep = queue.shift()!;
		while (queue.length > 0) {
			if (Array.isArray(currNode)) {
				// TODO ask Eirik about this
				// eslint-disable-next-line no-loop-func
				currNode = currNode.map((n) => n[currDep]).filter((n) => n);
			} else {
				currNode = currNode[currDep] as GraphNode;
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
function invalidator(prop: NodeProp | ValueProp, accessor: string | ((g: GraphNode) => any)) {
	return function* (a: GraphNode): Iterable<PropertyAssertion> {
		const declared = typeof accessor === 'string' ? (a.properties.get(accessor) || [undefined])[0] : accessor(a);
		const prev = a[prop];
		if (declared === prev) return;
		if (prev) yield { action: 'remove', assertion: { type: 'property', node: a, key: prop, value: prev } };
		a[prop] = declared;
		if (declared) yield { action: 'add', assertion: { type: 'property', node: a, key: prop, value: declared } };
		yield* propagator(a, prop);
	};
}
const propInvalidations: { [index in NodeProp | ValueProp]: (node: GraphNode) => Iterable<PropertyAssertion> } = {
	[labelKey]: invalidator(labelKey, labelIri),
	[colorKey]: invalidator(colorKey, colorIri),
	symbolName: invalidator('symbolName', hasSvgIri),
	[simpleShapeKey]: invalidator(simpleShapeKey, hasSimpleSymbolIri),
	[rotationKey]: invalidator(rotationKey, (g) => (g.properties.has(rotationIri) ? parseInt(g.properties.get(rotationIri)![0]) : undefined)),
	symbol: invalidator('symbol', (g) => (g['symbolName'] ? getSymbol(g['symbolName'], { rotation: g[rotationKey] }) : undefined)),
	connectorName: invalidator('connectorName', hasConnectorSuffixIri),
	relativePosition: invalidator('relativePosition', (g) => {
		if (!g.parent) return undefined;
		if (!g.connectorName || !g.parent.symbol) return new Point(0, 0);
		const c = g.parent.symbol.connectors.find((x) => x.id === g.connectorName);
		return c?.point || new Point(0, 0);
	}),
	[connectorKey]: function* (g: GraphNode) {
		const declared = g.outgoing.get(hasConnectorIri);
		const prev = g[connectorKey];
		if (setEquals(declared || [], prev || [])) return;
		if (prev) yield { action: 'remove', assertion: { type: 'property', node: g, key: connectorKey, value: prev } };
		g.connector = declared ? [...declared] : undefined;
		if (declared) yield { action: 'add', assertion: { type: 'property', node: g, key: connectorKey, value: g.connector } };
		yield* propagator(g, connectorKey);
	},
	[compoundNodeKey]: function* (g: GraphNode) {
		const declared = (g.incoming.get(hasConnectorIri) || [undefined])[0];
		const prev = g.parent;
		if (declared === prev) return;
		if (prev) yield { action: 'remove', assertion: { type: 'property', node: g, key: compoundNodeKey, value: prev } };
		g.parent = declared;
		if (declared) yield { action: 'add', assertion: { type: 'property', node: g, key: compoundNodeKey, value: g.parent } };
		yield* propagator(g, compoundNodeKey);
	},
};

export function patchGraph<M extends GraphState, P extends RdfPatch2>(state: M, patch: P): GraphStateProps {
	const graphPatch: GraphAssertion[] = [];
	for (const p of patch) {
		const q = p.assertion;
		let sNode: GraphNode, pNode: GraphNode, oNode: GraphNode;
		const sTerm = termToId(q.subject);
		const pTerm = termToId(q.predicate);
		const oTerm = q.object.termType !== 'Literal' ? termToId(q.object) : false;

		switch (p.action) {
			case 'add':
				// Subject
				if (!state.nodeIndex.has(sTerm)) {
					sNode = { type: 'node', id: sTerm, ...initG() };
					state.nodeIndex.set(sTerm, sNode);
					graphPatch.push({ action: 'add', assertion: sNode });
				} else {
					sNode = state.nodeIndex.get(sTerm)!;
				}
				// Object literal
				if (!oTerm) {
					add(sNode.properties, pTerm, q.object.value);

					if (predicate2prop.hasOwnProperty(pTerm)) {
						for (const ass of propInvalidations[predicate2prop[pTerm] as ValueProp](sNode)) graphPatch.push(ass);
					}
					continue;
				}
				// Predicate
				if (!state.nodeIndex.has(pTerm)) {
					pNode = { id: pTerm, type: 'linkNode', ...initG() };
					state.nodeIndex.set(pTerm, pNode);
					graphPatch.push({ action: 'add', assertion: pNode });
				} else {
					pNode = state.nodeIndex.get(pTerm)!;
					if (pNode.type === 'node') {
						graphPatch.push({ action: 'remove', assertion: { type: 'property', node: pNode, key: 'type', value: 'node' } });
						pNode.type = 'linkNode';
						graphPatch.push({ action: 'add', assertion: { type: 'property', node: pNode, key: 'type', value: 'linkNode' } });
					}
				}

				// Object IRI
				if (!state.nodeIndex.has(oTerm)) {
					oNode = { id: oTerm, type: 'node', ...initG() };
					state.nodeIndex.set(oTerm, oNode);
					graphPatch.push({ action: 'add', assertion: oNode });
				} else {
					oNode = state.nodeIndex.get(oTerm)!;
				}
				const linkId = quadToString(q);
				const addLink: GraphEdge = {
					id: linkId,
					source: sTerm,
					target: oTerm,
					sourceRef: sNode,
					targetRef: oNode,
					linkRef: pNode,
					type: 'link',
				};
				add(sNode.outgoing, pTerm, oNode);
				add(oNode.incoming, pTerm, sNode);
				pNode.links.push(addLink);
				state.linkIndex.set(linkId, addLink);
				const edgeAssertion: EdgeAssertion = { action: 'add', assertion: addLink };
				graphPatch.push(edgeAssertion);

				if (predicate2prop.hasOwnProperty(pTerm)) {
					for (const ass of propInvalidations[predicate2prop[pTerm] as NodeProp](sNode)) graphPatch.push(ass);
				}
				break;
			case 'remove':
				sNode = state.nodeIndex.get(sTerm)!; // || (() => { throw ("strange error"); })();
				pNode = state.nodeIndex.get(pTerm)!; // || (() => { throw ("strange error"); })();
				if (!oTerm) {
					// TODO: check post-process
					//graphPatch.push({ action: 'remove', assertion: { type: 'property', node: pNode, key: pTerm, value: p.assertion.object.value } });
					remove(sNode.properties, pTerm, p.assertion.object.value);
					if (predicate2prop.hasOwnProperty(pTerm)) {
						for (const ass of propInvalidations[predicate2prop[pTerm] as ValueProp](sNode)) graphPatch.push(ass);
					}
				} else {
					oNode = state.nodeIndex.get(oTerm)!; // || (() => { throw ("strange error"); })();
					const delLinkId = quadToString(q);
					const delLink = state.linkIndex.get(delLinkId)!;
					state.linkIndex.delete(delLinkId);
					removeElement(pNode.links, delLink);
					remove(sNode.outgoing, pTerm, oNode);
					remove(oNode.incoming, pTerm, sNode);
					const edgeAssertion: EdgeAssertion = { action: 'remove', assertion: delLink };
					// TODO: Check post-process
					graphPatch.push(edgeAssertion);

					if (predicate2prop.hasOwnProperty(pTerm)) {
						for (const ass of propInvalidations[predicate2prop[pTerm] as NodeProp](sNode)) graphPatch.push(ass);
					}
					if (refCount(oNode) < 1) {
						state.nodeIndex.delete(oTerm);
						graphPatch.push({ action: 'remove', assertion: oNode });
					}
					if (refCount(pNode) < 1) {
						state.nodeIndex.delete(pTerm);
						graphPatch.push({ action: 'remove', assertion: pNode });
					}
				}
				if (refCount(sNode) < 1) {
					state.nodeIndex.delete(sTerm);
					graphPatch.push({ action: 'remove', assertion: sNode });
				}

				break;
		}
	}
	return { graphState: state, graphPatch: graphPatch };
}
