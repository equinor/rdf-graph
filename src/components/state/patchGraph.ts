import { Quad, termToId, Writer } from 'n3';
import { RdfPatch2 } from '../../models';
import {
	GraphEdge,
	GraphState,
	GraphNode,
	GraphPatch,
	GraphAssertion,
	GraphPropertyIdentifier,
	EdgeAssertion,
	PropertyAssertion,
} from '../../models/graphModel';
import { GraphStateProps } from './GraphStateProps';
import {
	colorKey,
	labelKey,
	simpleSvgKey,
	compoundNodeKey,
	connectorKey,
	svgKey,
	rotationKey,
	hasSvgIri,
	rotationIri,
	hasConnectorIri,
	hasConnectorSuffixIri,
	labelIri,
} from '../../mapper/predicates';
import { getSymbol, Point, SymbolRotation } from '../../symbol-api';
import { NodeType } from '../../models/nodeType';

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
const PropIris = [hasSvgIri, rotationIri, hasConnectorSuffixIri, labelIri] as const;
const EdgeIris = [hasConnectorIri] as const;
type PropIri = typeof PropIris[number];
type EdgeIri = typeof EdgeIris[number];
type ProcessDefinition<T> = { dependencies: (PropIri | EdgeIri)[]; process: (g: T) => Iterable<GraphAssertion> };
type PostProcessDefinitions = { [prop in PropIri]: ProcessDefinition<PropertyAssertion> } & { [prop in EdgeIri]: ProcessDefinition<EdgeAssertion> };

const defaultPostProcess: PostProcessDefinitions = {
	[hasSvgIri]: { dependencies: [], process: processHasSvg },
	[rotationIri]: { dependencies: [], process: (g) => [] },
	[hasConnectorSuffixIri]: { dependencies: [], process: (g) => [] },
	[labelIri]: { dependencies: [], process: (g) => [] },
	[hasConnectorIri]: { dependencies: [], process: (g) => [] },
};
function* processHasSvg(g: PropertyAssertion): Iterable<GraphAssertion> {
	if (g.action == 'add') {
		const rotation = g.assertion.node.properties.has(rotationIri) && parseInt(g.assertion.node.properties.get(rotationIri)![0]);
		const symbol = getSymbol(g.assertion.value, { rotation: rotation ? (rotation as SymbolRotation) : undefined });
		yield { action: 'add', assertion: { type: 'property', node: g.assertion.node, key: svgKey, value: symbol.svg } };
		yield { action: 'add', assertion: { type: 'property', node: g.assertion.node, key: 'imageWidth', value: symbol.width.toString() } };
		yield { action: 'add', assertion: { type: 'property', node: g.assertion.node, key: 'imageHeight', value: symbol.height.toString() } };
		yield { action: 'add', assertion: { type: 'property', node: g.assertion.node, key: 'nodeType', value: NodeType.SymbolContainer.toString() } };

		for (const conn of g.assertion.node.outgoing.get(hasConnectorIri) || []) {
			let relativePosition: Point = { x: 0, y: 0 };
			const connectorFromData = conn.properties.get(hasConnectorSuffixIri);
			const connectorFromApi = symbol.connectors.find((apiConnector) => apiConnector.id === connectorFromData?.[0]);
			if (connectorFromApi) {
				relativePosition = connectorFromApi.point;
			}
			yield { action: 'add', assertion: { type: 'property', node: conn, key: 'relativePositionX', value: relativePosition.x.toString() } };
			yield { action: 'add', assertion: { type: 'property', node: conn, key: 'relativePositionY', value: relativePosition.y.toString() } };
			yield {
				action: 'add',
				assertion: { type: 'property', node: g.assertion.node, key: 'nodeType', value: NodeType.SymbolConnector.toString() },
			};
		}
	}
	if (g.action == 'remove') {
		//todo: cleanup
	}

	return;
}

function reverseDependencies(map: PostProcessDefinitions) {
	const o = {} as PostProcessDefinitions;
	for (const [k, v] of Object.entries(map)) {
		if (k in PropIris) {
			o[k as PropIri] = { dependencies: [], process: v.process } as ProcessDefinition<PropertyAssertion>;
		} else {
			o[k as EdgeIri] = { dependencies: [], process: v.process } as ProcessDefinition<EdgeAssertion>;
		}
	}
	for (const [k, v] of Object.entries(map)) {
		for (const dep of v.dependencies) {
			o[dep].dependencies.push(k as PropIri | EdgeIri);
		}
	}
	return o;
}
function* handlePostProcessing(
	map: Map<string, (PropertyAssertion | EdgeAssertion)[]>,
	keys: (EdgeIri | PropIri)[],
	definition: PostProcessDefinitions
): Iterable<GraphAssertion> {
	for (const key of keys) {
		if (!map.has(key)) continue;
		yield* handlePostProcessing(map, definition[key as PropIri | EdgeIri].dependencies, definition);
		const def = definition[key as PropIri | EdgeIri];
		const asses = map.get(key)!;
		for (const ass of asses) {
			if (ass.assertion.type === 'property') {
				yield* (def as ProcessDefinition<PropertyAssertion>).process(ass as PropertyAssertion);
			} else if (ass.assertion.type === 'link') {
				yield* (def as ProcessDefinition<EdgeAssertion>).process(ass as EdgeAssertion);
			}
		}
		map.delete(key);
	}
}
export function patchGraph<M extends GraphState, P extends RdfPatch2>(
	state: M,
	patch: P,
	postProcess: PostProcessDefinitions = defaultPostProcess
): GraphStateProps {
	const graphPatch: GraphAssertion[] = [];
	const addMap = new Map<PropIri | EdgeIri, (PropertyAssertion | EdgeAssertion)[]>();
	const removeMap = new Map<PropIri | EdgeIri, (PropertyAssertion | EdgeAssertion)[]>();
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
					// TODO: Check postProcess
					const post = postProcess[pTerm as PropIri];
					if (post) {
						add(addMap, pTerm, { action: 'add', assertion: { type: 'property', node: sNode, key: pTerm, value: q.object.value } });
					}
					//graphPatch.push({ action: 'add', assertion: { type: 'property', node: sNode, key: pTerm, value: q.object.value } });
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
				// TODO: check postProcess
				const post = postProcess[pTerm as EdgeIri];
				const edgeAssertion: EdgeAssertion = { action: 'add', assertion: addLink };
				if (post) {
					add(addMap, pTerm, edgeAssertion);
				}
				graphPatch.push(edgeAssertion);
				break;
			case 'remove':
				sNode = state.nodeIndex.get(sTerm)!; // || (() => { throw ("strange error"); })();
				pNode = state.nodeIndex.get(pTerm)!; // || (() => { throw ("strange error"); })();
				if (!oTerm) {
					// TODO: check post-process
					//graphPatch.push({ action: 'remove', assertion: { type: 'property', node: pNode, key: pTerm, value: p.assertion.object.value } });
					remove(sNode.properties, pTerm, p.assertion.object.value);
					const post = postProcess[pTerm as PropIri];
					if (post) {
						add(removeMap, pTerm, {
							action: 'remove',
							assertion: { type: 'property', node: pNode, key: pTerm, value: p.assertion.object.value },
						});
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
					const post = postProcess[pTerm as PropIri];
					if (post) {
						add(removeMap, pTerm, edgeAssertion);
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
	const delProcess = handlePostProcessing(removeMap, [...removeMap.keys()], reverseDependencies(postProcess));
	const addProcess = handlePostProcessing(addMap, [...addMap.keys()], postProcess);
	return { graphState: state, graphPatch: [...graphPatch, ...delProcess, ...addProcess] };
}

type PostProcess = {
	priority: number;
	add: (patch: GraphAssertion) => Iterable<GraphAssertion>;
	remove: (patch: GraphAssertion) => Iterable<GraphAssertion>;
};
function* concat<T>(...iterables: (Iterable<T> | undefined)[]) {
	for (const i of iterables) {
		if (!i) continue;
		yield* i!;
	}
}
export function postProcessGraph<M extends GraphState, P extends GraphPatch>(state: M, patch: P, rules: Map<string, PostProcess>) {
	const queue: { priority: number; process: () => Iterable<GraphAssertion> }[] = [];
	for (const a of patch) {
		let postProcess: PostProcess | undefined;
		switch (a.assertion.type) {
			case 'node':
				continue;
			case 'link':
				postProcess = rules.get(a.assertion.linkRef!.id);
				break;
			case 'linkNode':
				postProcess = rules.get(a.assertion.id);
				break;
			case 'property':
				postProcess = rules.get(a.assertion.key);
				break;
		}
		if (!postProcess) continue;
		const priority = a.action == 'add' ? postProcess.priority : -postProcess.priority;
		const post = a.action == 'add' ? postProcess.add : postProcess.remove;

		queue.push({ priority, process: () => post(a) });
	}
	queue.sort((a, b) => a.priority - b.priority);
	const newPatch: Iterable<GraphAssertion> = (function* () {
		for (const p of queue) {
			p.process();
		}
	})();
	return { state, patch: concat(patch, newPatch) };
}
