import { directPropConfig, directPropKeys } from '../src/propConfig';

describe('Known Properties', () => {
	it('Iris are unique', () => {
		const iris = directPropKeys.map((k) => directPropConfig[k].iri);

		const hasDuplicates = new Set(iris).size !== iris.length;

		expect(hasDuplicates).toBe(false);
	});
});
