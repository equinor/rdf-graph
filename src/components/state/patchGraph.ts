import { Quad, termToId, Writer } from 'n3';
import { RdfPatch2 } from '../../models';
import { GraphEdge, GraphState, GraphNode, GraphPatch, GraphAssertion } from '../../models/graphModel';
import { GraphStateProps } from './GraphStateProps';

const writer = new Writer();
const quadToString = ({ subject, predicate, object, graph }: Quad) => writer.quadToString(subject, predicate, object, graph);

export function patchGraph<M extends GraphState, P extends RdfPatch2>(model: M, patch: P): GraphStateProps {
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
				if (!model.nodeIndex.has(sTerm)) {
					sNode = { type: 'node', id: sTerm, refCount: 1 /*, x:0, y:0, z:0 */ };
					model.nodeIndex.set(sTerm, sNode);
					graphPatch.push({ action: 'add', assertion: sNode });
				} else {
					sNode = model.nodeIndex.get(sTerm)!; //|| (() => { throw ("strange error"); })();
					sNode.refCount++;
				}

				// Predicate
				if (!model.nodeIndex.has(pTerm)) {
					pNode = { id: pTerm, type: 'linkNode', refCount: 1 };
					model.nodeIndex.set(pTerm, pNode);
					graphPatch.push({ action: 'add', assertion: pNode });
				} else {
					pNode = model.nodeIndex.get(pTerm)!; // || (() => { throw ("strange error"); })();
					if (pNode.type === 'node') {
						pNode.type = 'linkNode';
						graphPatch.push({ action: 'remove', assertion: { type: 'property', id: pNode.id, key: 'type', value: 'link' } });
						graphPatch.push({ action: 'add', assertion: { type: 'property', id: pNode.id, key: 'type', value: 'linkNode' } });
					}
					pNode.refCount++;
				}
				// Object literal
				if (!oTerm) {
					sNode[pTerm] = q.object.value;
					graphPatch.push({ action: 'add', assertion: { type: 'property', id: sTerm, key: pTerm, value: q.object.value } });
					continue;
				}

				// Object IRI
				if (!model.nodeIndex.has(oTerm)) {
					oNode = { id: oTerm, type: 'node', refCount: 1 };
					model.nodeIndex.set(oTerm, oNode);
					graphPatch.push({ action: 'add', assertion: oNode });
				} else {
					oNode = model.nodeIndex.get(oTerm)!; // || (() => { throw ("strange error"); })();
					oNode.refCount++;
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
				model.linkIndex.set(linkId, addLink);
				graphPatch.push({ action: 'add', assertion: addLink });
				break;
			case 'remove':
				sNode = model.nodeIndex.get(sTerm)!; // || (() => { throw ("strange error"); })();
				sNode.refCount--;
				if (sNode.refCount < 1) {
					model.nodeIndex.delete(sTerm);
					graphPatch.push({ action: 'remove', assertion: { type: 'node', id: sTerm } });
				}

				pNode = model.nodeIndex.get(pTerm)!; // || (() => { throw ("strange error"); })();
				pNode.refCount--;
				if (pNode.refCount < 1) {
					model.nodeIndex.delete(pTerm);
					graphPatch.push({ action: 'remove', assertion: { type: 'node', id: pTerm } });
				}
				if (!oTerm) {
					graphPatch.push({ action: 'remove', assertion: { type: 'property', id: pTerm, key: pTerm, value: sNode[pTerm] } });
					delete sNode[pTerm];
					continue;
				}
				oNode = model.nodeIndex.get(oTerm)!; // || (() => { throw ("strange error"); })();
				oNode.refCount--;
				if (oNode.refCount < 1) {
					model.nodeIndex.delete(oTerm);
					graphPatch.push({ action: 'remove', assertion: { type: 'node', id: oTerm } });
				}
				const delLinkId = quadToString(q);
				model.linkIndex.delete(delLinkId);
				graphPatch.push({ action: 'remove', assertion: { type: 'link', id: delLinkId } });
				break;
		}
	}
	return { graphState: model, graphPatch: graphPatch };
}
