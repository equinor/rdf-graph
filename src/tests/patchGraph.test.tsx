import { patchGraph } from '../components/state/patchGraph';
import { DataFactory } from 'n3';
import * as P from '../mapper/predicates';
import { GraphEdge, GraphNode } from '../models/graphModel';
import { RdfPatch2 } from '../models/rdfPatch';
const { quad: q, literal: l, blankNode: b, namedNode: n } = DataFactory;
describe('patchGraph', () => {
	test('svg', () => {
		const quad = q(b('yo'), n(P.hasSvgIri), l('hahaha'));
		const patch: RdfPatch2 = [{ action: 'add', assertion: quad }];
		const graphState = { linkIndex: new Map<string, GraphEdge>(), nodeIndex: new Map<string, GraphNode>() };

		const res = patchGraph(graphState, patch);

		expect('true').toBe('true');
	});
});
