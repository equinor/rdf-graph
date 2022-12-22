import { KnownPropKey, PROPS } from '@rdf-graph/types/types';

export type RdfNamespaceKey = 'ui' | 'io' | 'animals' | 'rdfs';

export const ns: Record<RdfNamespaceKey, string> = {
	ui: 'http://rdf.equinor.com/ui/',
	io: 'http://rdf-graph.io/',
	animals: 'http://rdf-graph.io/dyr/',
	rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
} as const;

export const predicateIri = {
	connectedTo: ns.io + 'connectedTo',
} as const;

const iris: string[] = [];

export function getKnownIris() {
	if (iris.length === 0) {
		iris.push(
			...(Object.keys(PROPS) as KnownPropKey[])
				.map((k) => PROPS[k].iri)
				.concat(Object.values(predicateIri))
				.filter((iri) => iri !== 'null')
		);
	}
	return iris;
}

function predicateToShortForm(predicate: string) {}
