import { rdfObjectKey, rdfPredicateKey, rdfSubjectKey } from '../components/sparqlGraph/cytoscapeDataKeys';
import { turtle2Elements } from '../mapper';

const a = 'http://example.com/a';
const b = 'http://example.com/b';
const connected = 'http://example.com/connected';
const color = 'http://rdf.equinor.com/ui/color';

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
  `;

		const elements = await turtle2Elements(turtle);
		const ids = elements.map((e) => e.data.id);

		console.log(elements);
		expect(ids).toContain(a);

		const elementA = elements.find((e) => e.data.id === a)!;
		expect(elementA.data['color']).toBe('green');
	});
});
