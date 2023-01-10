import { directPropConfig } from '@rdf-graph/propConfig';
import { DirectPropKey } from '@rdf-graph/types/core';

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
			...(Object.keys(directPropConfig) as DirectPropKey[])
				.map((k) => directPropConfig[k].iri)
				.concat(Object.values(predicateIri))
		);
	}
	return iris;
}