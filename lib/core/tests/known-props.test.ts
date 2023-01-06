import { DirectPropKey, PROPS as P } from '../types/core';

describe('Known Properties', () => {
	it('Iris are unique', () => {
		const keys = Object.keys(P) as DirectPropKey[];

		const iris = keys.map((k) => P[k].iri);

		const hasDuplicates = new Set(iris).size !== iris.length;

		expect(hasDuplicates).toBe(false);
	});
});
