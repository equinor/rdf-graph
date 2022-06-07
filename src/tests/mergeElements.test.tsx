import { ElementDefinition } from 'cytoscape';
import { mergeElementsByKey } from '../mapper/mergeElements';
import { RdfNodeDefinition } from '../models/cytoscapeApi.types';

const createDummyElements1 = (ids: string[], predicates: { key: string; value: string }[]): RdfNodeDefinition[] => {
	return ids.flatMap((id) =>
		predicates.map((pair) => {
			return {
				data: {
					id: id,
					rdfData: [pair],
					rdfParents: [],
					rdfChildren: [],
					rdfIncoming: [],
					rdfOutgoing: [],
				},
			};
		})
	);
};

const createDummyElements2 = (ids: string[], predicates: { key: string; value: string }[]): RdfNodeDefinition[] => {
	return ids.map((id) => {
		return {
			data: {
				id: id,
				rdfData: predicates,
				rdfChildren: [],
				rdfParents: [],
				rdfIncoming: [],
				rdfOutgoing: [],
			},
		};
	});
};

const setData = (es: ElementDefinition[]) => {
	return new Set(es[0].data.rdfData);
};

describe('Merge element', () => {
	test('Elements with rdf merged correctly', async () => {
		const p1 = { key: '1', value: '1' };
		const p2 = { key: '2', value: '2' };

		const elements: RdfNodeDefinition[] = createDummyElements1(['1'], [p1, p2]);

		const actual = setData(mergeElementsByKey(elements));
		const expected = setData(createDummyElements2(['1'], [p1, p2]));

		expect(actual).toMatchObject(expected);
	});

	test('Elements without rdf', async () => {
		const elements: ElementDefinition[] = [{ data: { id: '1' } }];

		const merged = mergeElementsByKey(elements);

		expect(merged).toMatchObject([{ data: { id: '1' } }]);
	});

	test('Elements with same predicate', async () => {
		const p1 = { key: '1', value: '1' };
		const p2 = { key: '1', value: '2' };

		const elements: RdfNodeDefinition[] = createDummyElements1(['1'], [p1, p2]);

		const merged = mergeElementsByKey(elements);

		expect(merged).toMatchObject(createDummyElements2(['1'], [p2]));
	});
});
