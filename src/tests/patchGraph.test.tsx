/* eslint-disable jest/no-conditional-expect */
import { patchGraph } from '../components/state/patchGraph';
import { DataFactory, termToId } from 'n3';
import * as P from '../mapper/predicates';
import { GraphEdge, GraphNode } from '../models/graphModel';
import { RdfPatch2 } from '../models/rdfPatch';
import { SymbolKey } from '../symbol-api';
const { quad: q, literal: l, namedNode: n } = DataFactory;
describe('patchGraph', () => {
	test('normal svg', () => {
		const quads = [
			q(n('S'), P.hasSvgPredicate, l('Separator_1')),
			q(n('S'), P.hasConnectorPredicate, n('C')),
			q(n('C'), P.hasConnectorSuffixPredicate, l('c1')),
		];

		const patch: RdfPatch2 = quads.map((quad) => {
			return { action: 'add', assertion: quad };
		});
		const graphState = { linkIndex: new Map<string, GraphEdge>(), nodeIndex: new Map<string, GraphNode>() };
		const res = patchGraph(graphState, patch);
		const assertions = [...res.graphPatch];

		for (const q of quads) {
			let node;
			switch (termToId(q.predicate)) {
				case P.hasSvgIri:
					node = res.graphState.nodeIndex.get(termToId(q.subject));
					expect(node!.symbolName).toBe(q.object.value);
					if (node!.symbolName! in SymbolKey) {
						expect(node!.symbol).toBeTruthy();
					}
					break;
				case P.hasConnectorIri:
					const parent = res.graphState.nodeIndex.get(termToId(q.subject));
					const child = res.graphState.nodeIndex.get(termToId(q.object));
					expect(child!.parent!).toBe(parent);
					expect(parent!.connector!).toContain(child);
					break;
				case P.hasConnectorSuffixIri:
					node = res.graphState.nodeIndex.get(termToId(q.subject));
					expect(node!.connectorName!).toBe(q.object.value);
					for (const c of node!.parent!.symbol!.connectors) {
						if (c.id === q.object.value) expect(c.point).toMatchObject(node!.relativePosition!);
					}
					break;
			}
		}
	});

	test('Without existing connector', () => {
		const quads = [
			q(n('S'), P.hasSvgPredicate, l('Separator_1')),
			q(n('S'), P.hasConnectorPredicate, n('C')),
			q(n('C'), P.hasConnectorSuffixPredicate, l('c11')),
		];

		const patch: RdfPatch2 = quads.map((quad) => {
			return { action: 'add', assertion: quad };
		});
		const graphState = { linkIndex: new Map<string, GraphEdge>(), nodeIndex: new Map<string, GraphNode>() };
		const res = patchGraph(graphState, patch);
		expect(res.graphState.nodeIndex.get('C')!.relativePosition!).toMatchObject({ x: 0, y: 0 });
	});
});
