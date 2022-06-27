import { patchGraph } from '../components/state/patchGraph';
import { DataFactory } from 'n3';
import * as P from '../mapper/predicates';
import { GraphEdge, GraphNode } from '../models/graphModel';
import { RdfPatch2 } from '../models/rdfPatch';
const { quad: q, literal: l, blankNode: b, namedNode: n } = DataFactory;
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

		expect(
			assertions.find(
				(a) =>
					a.action === 'add' &&
					a.assertion.type === 'property' &&
					a.assertion.key === 'imageWidth' &&
					a.assertion.value === '117' &&
					a.assertion.node.id === 'S'
			)
		).toBeTruthy();

		expect(
			assertions.find(
				(a) =>
					a.action === 'add' &&
					a.assertion.type === 'property' &&
					a.assertion.key === 'relativePositionX' &&
					a.assertion.value === '-8' &&
					a.assertion.node.id === 'C'
			)
		).toBeTruthy();
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
		const assertions = [...res.graphPatch];

		expect(
			assertions.find(
				(a) =>
					a.action === 'add' &&
					a.assertion.type === 'property' &&
					a.assertion.key === 'imageWidth' &&
					a.assertion.value === '117' &&
					a.assertion.node.id === 'S'
			)
		).toBeTruthy();

		expect(
			assertions.find(
				(a) =>
					a.action === 'add' &&
					a.assertion.type === 'property' &&
					a.assertion.key === 'relativePositionX' &&
					a.assertion.value === '0' &&
					a.assertion.node.id === 'C'
			)
		).toBeTruthy();
	});
});
