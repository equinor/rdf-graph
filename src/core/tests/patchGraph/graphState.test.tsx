/* eslint-disable jest/no-conditional-expect */
import { patchGraph } from '../../state/patchGraph';
import { termToId } from 'n3';
import * as P from '../../mapper/predicates';
import {
	emptyGraph,
	svgWithConnectorQuads,
	testSymbolConnectorSuffix_1,
	testSymbolId,
	toAddPatch,
} from './testUtils';
import { defaultSymbolProvider } from '../../ui/defaultSymbolProvider';
import { symbolLibrary } from '../../../symbol-api';

describe('patchGraph', () => {
	test('normal svg', () => {
		const quads = svgWithConnectorQuads(testSymbolConnectorSuffix_1);
		const res = patchGraph(emptyGraph(), toAddPatch(quads), {
			symbolProvider: defaultSymbolProvider,
		});
		for (const _ of res.graphPatch) {
		}
		for (const q of quads) {
			let node;
			switch (termToId(q.predicate)) {
				case P.hasSvgIri:
					node = res.graphState.nodeIndex.get(termToId(q.subject));
					expect(node!.symbolName).toBe(q.object.value);
					if (node!.symbolName! in symbolLibrary) {
						expect(node!.symbol).toBeTruthy();
					}
					break;
				case P.hasConnectorIri:
					const parent = res.graphState.nodeIndex.get(termToId(q.subject));
					const child = res.graphState.nodeIndex.get(termToId(q.object));
					expect(child!.node!).toBe(parent);
					expect(parent!.connector!).toContain(child);
					break;
				case P.hasConnectorSuffixIri:
					node = res.graphState.nodeIndex.get(termToId(q.subject));
					expect(node!.connectorName!).toBe(q.object.value);
					for (const c of node!.node!.symbol!.connectors) {
						if (c.id === q.object.value) expect(c.point).toMatchObject(node!.relativePosition!);
					}
					break;
			}
		}
	});

	test('Without existing connector', () => {
		const res = patchGraph(
			emptyGraph(),
			toAddPatch(svgWithConnectorQuads(`I don't exist in ${testSymbolId}`)),
			{
				symbolProvider: defaultSymbolProvider,
			}
		);
		for (const _ of res.graphPatch) {
		}
		expect(res.graphState.nodeIndex.get('C')!.connectorRelativePosition!).toMatchObject({
			x: 0,
			y: 0,
		});
	});
});
