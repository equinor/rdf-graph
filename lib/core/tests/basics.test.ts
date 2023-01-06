import { DataFactory } from 'n3';
import { patchGraphState } from 'core/patch';
import { newGraphState, toAddPatch } from './test-utils';
import { PROPS as P } from '../types/core';

const { quad: q, literal: l, namedNode: n } = DataFactory;

describe('Basics', () => {
	it('Add patch', () => {
		const state = newGraphState();

		const rdfPatch = toAddPatch([q(n('S'), n(P.fill.iri), l('7fjell'))]);

		const patchGraphResult = patchGraphState(state, rdfPatch);

		expect(patchGraphResult.graphPatches.length).toBe(2);
		expect(patchGraphResult.graphPatches[0].action).toBe('add');
		expect(patchGraphResult.graphPatches[0].element.type).toBe('node');
	});
});
