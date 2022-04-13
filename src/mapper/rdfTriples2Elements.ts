import { ElementDefinition } from 'cytoscape';
import { nanoid } from 'nanoid';
import { rdfObjectKey, rdfPredicateKey, rdfSubjectKey } from '../components/sparqlGraph/cytoscapeDataKeys';
import { DisplayControllingPredicate, RdfTriple } from '../models';
import { onlyUnique, short } from '../utils';

const defaultUri = undefined;
const compoundNodePredicate = 'http://rdf.equinor.com/ui/parent';
const nodeTypePredicate = 'http://rdf.equinor.com/raw/stid/JSON_PIPELINE#tagType';
const labelPredicate = 'http://www.w3.org/2000/01/rdf-schema#label';
const colorPredicate = 'http://rdf.equinor.com/ui/color';

const parentDisplayEdge = new DisplayControllingPredicate(compoundNodePredicate, 'parent', true, (o) => o);
const iconDisplayEdge = new DisplayControllingPredicate(nodeTypePredicate, 'image', false, (o) => node2ImageUri(o));
const labelDisplayEdge = new DisplayControllingPredicate(labelPredicate, 'label', false, (o) => o);

const colorEdge = new DisplayControllingPredicate(colorPredicate, 'color', false, (o) => o);

const displayEdges = [parentDisplayEdge, iconDisplayEdge, labelDisplayEdge, colorEdge];

/* This function is a bit complicated so it deserves a comment*/

export const rdfTriples2Elements = (edges: RdfTriple[]) => {
	const displayPredicate2UiEdges: { [predicate: string]: UiEdge[] } = Object.fromEntries(
		displayEdges.map(({ predicate, mapping }) => [
			predicate,
			edges.filter(({ rdfPredicate: type }) => predicate === type).map(({ rdfSubject: from, rdfObject: to }) => new UiEdge(from, mapping(to))),
		])
	);

	const displayNodesEdges = edges.filter(({ rdfPredicate: type }) =>
		displayEdges
			.filter(({ keepNode }) => keepNode)
			.map(({ predicate }) => predicate)
			.includes(type)
	);

	const primaryEdges = edges.filter(({ rdfPredicate: type }) => !displayEdges.map(({ predicate }) => predicate).includes(type));
	const uiEdges = Object.keys(displayPredicate2UiEdges).flatMap((k) => displayPredicate2UiEdges[k]);
	const uiSubjects = uiEdges.map((uiEdge) => uiEdge.from);

	const cytoscapeNodes = primaryEdges
		.concat(displayNodesEdges)
		.flatMap((e) => [e.rdfSubject, e.rdfObject])
		.concat(uiSubjects)
		.filter(onlyUnique)
		.map((n) => {
			const cyNode: ElementDefinition = { data: { id: n } };
			displayEdges.forEach(({ predicate, dataProperty }) => {
				const value = displayPredicate2UiEdges[predicate].find(({ from }) => from === n)?.to;
				if (value) {
					cyNode.data[dataProperty] = value;
				}
			});
			return cyNode;
		});

	const cytoscapeEdges = primaryEdges.map(edge2CytoscapeEdge);

	return [...cytoscapeNodes, ...cytoscapeEdges];
};

const node2ImageUri = (type: string | undefined): string | undefined => {
	if (!type) {
		return defaultUri;
	}
	return type2ImageUri[type] || defaultUri;
};

const edge2CytoscapeEdge = (triple: RdfTriple): ElementDefinition => {
	let edgeElement: ElementDefinition = {
		data: {
			source: triple.rdfSubject,
			target: triple.rdfObject,
			id: nanoid(),
			label: short(triple.rdfPredicate),
		},
	};

	edgeElement.data[rdfSubjectKey] = triple.rdfSubject;
	edgeElement.data[rdfPredicateKey] = triple.rdfPredicate;
	edgeElement.data[rdfObjectKey] = triple.rdfObject;

	return edgeElement;
};

/**
 * NB! Hard coded dependency on STID-dataset predicates and values.
 * Should ideally be refactored out to some external mapping and/or
 * user-template feature
 */
const type2ImageUri: { [key: string]: string } = {
	HJ: 'https://dugtrioexperimental.blob.core.windows.net/graph-icons/symbols/IM005A.svg', //Compact heat exchangers
	VG: 'https://dugtrioexperimental.blob.core.windows.net/graph-icons/symbols/IM005B.svg', //Scrubbers
	L: 'https://dugtrioexperimental.blob.core.windows.net/graph-icons/symbols/PP009A.svg', //Plant piping
	HA: 'https://dugtrioexperimental.blob.core.windows.net/graph-icons/symbols/IM005B.svg', //Shell and tube heat exchangers
	VE: 'https://dugtrioexperimental.blob.core.windows.net/graph-icons/symbols/IM005B.svg', //Columns and towers
	XSV: 'https://dugtrioexperimental.blob.core.windows.net/graph-icons/symbols/PV005A.svg', //Process Shutdown, Safety Activation Valve
	XX: 'https://dugtrioexperimental.blob.core.windows.net/graph-icons/symbols/IM005B.svg', //Miscellaneous equipment packages
	LV: 'https://dugtrioexperimental.blob.core.windows.net/graph-icons/symbols/PV023A-1.svg', //Level, Valve
	TA: 'https://dugtrioexperimental.blob.core.windows.net/graph-icons/symbols/IM005B.svg', //Storage tanks, cylindrical
	PA: 'https://dugtrioexperimental.blob.core.windows.net/graph-icons/symbols/IM005B.svg', //Centrifugal pumps
	PV: 'https://dugtrioexperimental.blob.core.windows.net/graph-icons/symbols/ND0006.svg',
};

class UiEdge {
	constructor(from: string, to: string | undefined) {
		this.from = from;
		this.to = to;
	}

	from: string;
	to: string | undefined;
}
