import { directPropConfig, DirectPropKey, KnownRdfPrefix, RdfPrefix } from '@equinor/rdf-graph';

export type RdfNamespaceKey = 'io' | 'animals' | 'ex' | 'rec';

export const devPrefixes: Record<string, string> = {
	io: 'http://rdf-graph.io/',
	animals: 'http://rdf-graph.io/dyr/',
	ex: 'http://example.com/',
	rec: 'https://rdf.equinor.com/ontology/record/',
} as const;

export const predicateIri = {
	connectedTo: devPrefixes.io + 'connectedTo',
	describes: devPrefixes.rec + 'describes',
	isInScope: devPrefixes.rec + 'isInScope',
	type: RdfPrefix.rdfs + 'type',
} as const;

const iris: string[] = [];
const irisPretty: string[] = [];

export function getKnownPredicateIris() {
	if (iris.length === 0) {
		iris.push(
			...(Object.keys(directPropConfig) as DirectPropKey[])
				.map((k) => directPropConfig[k].iri)
				.concat(Object.values(predicateIri))
		);
		iris.sort((a, b) => a.localeCompare(b));
	}
	return iris;
}

export function getKnownPredicateIrisPretty() {
	if (irisPretty.length === 0) {
		irisPretty.push(...getKnownPredicateIris().map((iri) => prettyIri(iri)));
		irisPretty.sort((a, b) => a.localeCompare(b));
	}
	return irisPretty;
}

const rdfPrefixes: Map<string, string> = new Map();

export function getRdfPrefixes() {
	if (rdfPrefixes.size > 0) return rdfPrefixes;

	(Object.keys(devPrefixes) as RdfNamespaceKey[]).forEach((k) => {
		rdfPrefixes.set(k, devPrefixes[k]);
	});

	(Object.keys(RdfPrefix) as KnownRdfPrefix[]).forEach((k) => rdfPrefixes.set(k, RdfPrefix[k]));

	//console.log('rdfPrefixes', rdfPrefixes);
	return rdfPrefixes;
}

export function prettyIri(iri: string) {
	if (!iri || !iri.startsWith('http')) return iri;

	let n = 0;
	let resolved_pre = '';

	for (const [pre, pre_val] of getRdfPrefixes()) {
		if (iri.length > pre_val.length) {
			if (iri.substring(0, pre_val.length) === pre_val) {
				if (pre_val.length > n) {
					n = pre_val.length;
					resolved_pre = pre;
				}
			}
		}
	}

	return n > 0 ? resolved_pre + ':' + iri.substring(n) : iri;
}

export function prettyToFullIri(iriWithPrefix: string) {
	const arr = iriWithPrefix.split(':');
	if (arr.length !== 2) return iriWithPrefix;
	const pre = getRdfPrefixes();
	return pre.has(arr[0]) ? pre.get(arr[0]) + arr[1] : iriWithPrefix;
}
