import { patchGraphState } from 'core/patch';
//import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { newGraphState, toAddPatch } from './test-utils';

import { DataFactory, Quad } from 'n3';

import { PROPS as P } from '../types/types';

const { quad: q, literal: l, namedNode: n } = DataFactory;

describe('asdasd', () => {
	it('sdsd', () => {
		const state = newGraphState();

		const rdfPatch = toAddPatch([q(n('S'), n(P.fill.iri), l(testSymbolId))]);

		const patchGraphResult = patchGraphState(state, rdfPatch);
	});
});
