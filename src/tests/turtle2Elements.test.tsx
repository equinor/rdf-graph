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

		expect(ids).toContain(a);

		const elementA = elements.find((e) => e.data.id === a)!;
		expect(elementA.data['color']).toBe('green');
	});

	test('Turtle with Connector OK', async () => {
		const turtle = String.raw`
		@prefix example:  <http://example.com#> .
		@prefix owl:      <http://www.w3.org/2002/07/owl#> .
		@prefix rdf:      <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
		@prefix rdfs:     <http://www.w3.org/2000/01/rdf-schema#> .
		@prefix ui:       <http://rdf.equinor.com/ui/> .
		@prefix xml:      <http://www.w3.org/XML/1998/namespace> .
		@prefix xsd:      <http://www.w3.org/2001/XMLSchema#> .

		# Node that provides 3 phase
		example:1  rdfs:label  "Well" ;
				ui:color    "brown" ;
				example:connectedTo example:3phaseIn .

		example:2  rdfs:label  "Stat pipe";
				ui:color    "red".

		example:3  rdfs:label  "Oil water processing";
				ui:color    "orange".

		example:seperator rdfs:label "seperator";
				ui:color "pink";
				ui:hasSvg "Separator_1";
				ui:hasConnector example:3phaseIn;
				ui:hasConnector example:GasOut;
				ui:hasConnector example:OilWaterOut .

		example:3phaseIn rdfs:label "3 phase in" ;
				ui:color "black" ;
				ui:hasConnectorSuffix "c1" .

		example:GasOut rdfs:label "Gas out" ;
			ui:color "black" ;
			ui:hasConnectorSuffix "c2" ;
			example:connectedTo example:2 .

		example:OilWaterOut rdfs:label "oil water out" ;
			ui:color "black" ;
			ui:hasConnectorSuffix "c3" ;
			example:connectedTo example:3 .
  		`;

		const elements = await turtle2Elements(turtle);
		const ids = elements.map((e) => e.data.id);

		expect(ids).toContain('http://example.com#GasOut');
		expect(ids).toContain('http://example.com#OilWaterOut');
		expect(ids).toContain('http://example.com#3phaseIn');
		expect(ids).toContain('http://example.com#seperator');

		const edges = elements.filter((e) => e.data.source && e.data.target);
		expect(edges.length).toBe(3);
		const connectorEdge = elements.find((e) => e.data.source && e.data.target === 'http://example.com#2');
		expect(connectorEdge).toBeTruthy();

		const gasOut = elements.find((e) => e.data.id === 'http://example.com#GasOut')!;
		expect(gasOut.data['parent']).toBe('http://example.com#seperator');
		expect(gasOut.data['nodeType']).toBe('connector');
		expect(gasOut['grabbable']).toBe(false);
		expect(gasOut['selectable']).toBe(false);
		expect(gasOut.position!['x']).toBe(-18);
		expect(34 - gasOut.position!['y']).toBeLessThan(0.1);
	});
});
