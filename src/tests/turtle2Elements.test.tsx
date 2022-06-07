import { rdfObjectKey, rdfPredicateKey, rdfSubjectKey } from '../components/sparqlGraph/cytoscapeDataKeys';
import { turtle2Elements } from '../mapper';
import { colorPredicate, labelPredicate } from '../mapper/predicates';
import { getData } from '../cytoscape-api/cytoscapeApi';
import { RdfNodeDataDefinition } from '../cytoscape-api/cytoscapeApi.types';

const a = 'http://example.com/a';
const b = 'http://example.com/b';
const connected = 'http://example.com/connected';
const color = 'http://rdf.equinor.com/ui/color';
const label = 'http://www.w3.org/2000/01/rdf-schema#label';

describe('Turtle to elements', () => {
	test('Simple turtle OK', async () => {
		const turtle = String.raw`
    		<${a}> <${connected}> <${b}> .
  		`;

		const elements = await turtle2Elements(turtle);
		const ids = elements.map((e) => e.data.id);

		expect(ids).toContain(a);
		expect(ids).toContain(b);

		const edges = elements.filter((e) => e.data.source && e.data.target);

		expect(edges.length).toBe(1);
		const e = edges[0];

		expect(e.data.source).toBe(a);
		expect(e.data.target).toBe(b);

		expect(e.data[rdfSubjectKey]).toBe(a);
		expect(e.data[rdfPredicateKey]).toBe(connected);
		expect(e.data[rdfObjectKey]).toBe(b);
	});

	test('Turtle with UI-edge OK', async () => {
		const turtle = String.raw`
    		<${a}> <${color}> "green" .
			<${a}> <${label}> "green node" .
  		`;

		const elements = await turtle2Elements(turtle);
		const ids = elements.map((e) => e.data.id);

		expect(ids).toContain(a);

		const elementA = elements.find((e) => e.data.id === a)!;
		const data = elementA.data as RdfNodeDataDefinition;

		expect(getData(data, colorPredicate.value)).toBe('green');
		expect(getData(data, labelPredicate.value)).toBe('green node');
	});
});
