import { KnownPropKey, PROPS as P } from '../types/types';

describe('Known Properties', () => {
	it('Iris are unique', () => {
		const keys = Object.keys(P) as KnownPropKey[];

		const iris = keys.map((k) => P[k].iri);

		const hasDuplicates = new Set(iris).size !== iris.length;

		expect(hasDuplicates).toBe(false);
	});
});
