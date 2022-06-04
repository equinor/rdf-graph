import { ElementDefinition } from 'cytoscape';
import { mergeElementsByKey } from '../mapper/mergeElements';
import { RdfNodeDefinition } from '../models/cytoscapeExtensions.types';

const createDummyElements1 = (ids: string[], predicates: { key: string; value: string }[]): RdfNodeDefinition[] => {
	return ids.flatMap((id) =>
		predicates.map((pair) => {
			return {
				data: {
					id: id,
					rdfData: [pair],
					rdfParents: [],
					rdfChildren: [],
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
			},
		};
	});
};

describe('Merge element', () => {
	test('Elements with rdf merged correctly', async () => {
		const p1 = { key: '1', value: '1' };
		const p2 = { key: '2', value: '2' };

		const elements: RdfNodeDefinition[] = createDummyElements1(['1'], [p1, p2]);

		const merged = mergeElementsByKey(elements);

		expect(merged).toMatchObject(createDummyElements2(['1'], [p1, p2]));
	});

	/*test('Elements without rdf', async () => {
		const elements: ElementDefinition[] = [{data: {id: "1"}}];

        const merged = mergeElementsByKey(elements);

        expect(merged).toMatchObject([{data: {id: "1"}}]);
    })

    test('Elements with same predicate', async () => {
        const p1 = {key: '1', value: '1'};
        const p2 = {key: '1', value: '2'};

		const elements: ElementDefinition[] = createDummyElements1(['1'],[p1, p2])

        const merged = mergeElementsByKey(elements);

        expect(merged).toMatchObject(createDummyElements2(['1'], [p2]));
    })*/
});
