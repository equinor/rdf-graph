import { ElementDefinition } from 'cytoscape';
import { RdfTriple } from '../models/rdfTriple';
import { onlyUnique, short } from '../utils';
import { useMappers } from '../utils';
import { DisplayControllingPredicate } from './displayControllingPredicate';
import { UiEdge } from './uiEdge';

export const useCytoscapeHelpers = () => {
	const [edges2ElementDefinitions] = useMappers();

	const defaultUri = undefined;
	const compoundNodePredicate = 'http://rdf.equinor.com/ui/parent';
	const nodeTypePredicate = 'http://rdf.equinor.com/raw/stid/JSON_PIPELINE#tagType';
	const labelPredicate = 'http://www.w3.org/2000/01/rdf-schema#label';
	const colorPredicate = 'http://rdf.equinor.com/ui/color';

	const parentDisplayEdge = new DisplayControllingPredicate(
		compoundNodePredicate,
		'parent',
		true,
		(o) => o,
		() => ''
	);
	const iconDisplayEdge = new DisplayControllingPredicate(
		nodeTypePredicate,
		'image',
		false,
		(o) => node2ImageUri(o),
		() => defaultUri
	);
	const labelDisplayEdge = new DisplayControllingPredicate(
		labelPredicate,
		'label',
		false,
		(o) => o,
		(s) => short(s)
	);

	const colorEdge = new DisplayControllingPredicate(
		colorPredicate,
		'color',
		false,
		(o) => o,
		() => undefined
	);

	const displayEdges = [parentDisplayEdge, iconDisplayEdge, labelDisplayEdge, colorEdge];

	const getPrimaryEdges = (edges: RdfTriple[]) =>
		edges.filter(({ rdfPredicate: type }) => !displayEdges.map(({ predicate }) => predicate).includes(type));
	const getCytoscapeElementsByEdges = (edges: RdfTriple[]) => {
		const displayPredicate2Edges: { [predicate: string]: UiEdge[] } = Object.fromEntries(
			displayEdges.map(({ predicate, mapping }) => [
				predicate,
				edges
					.filter(({ rdfPredicate: type }) => predicate === type)
					.map(({ rdfSubject: from, rdfObject: to }) => new UiEdge(from, mapping(to))),
			])
		);

		const displayNodesEdges = edges.filter(({ rdfPredicate: type }) =>
			displayEdges
				.filter(({ keepNode }) => keepNode)
				.map(({ predicate }) => predicate)
				.includes(type)
		);
		const primary = getPrimaryEdges(edges);
		const cytoscapeNodes = primary
			.concat(displayNodesEdges)
			.flatMap((e) => [e.rdfSubject, e.rdfObject])
			.filter(onlyUnique)
			.map((n) => {
				const cyNode: ElementDefinition = { data: { id: n } };
				displayEdges.forEach(({ predicate, dataProperty, fallback }) => {
					let value = displayPredicate2Edges[predicate].find(({ from }) => from === n)?.to;
					if (value === undefined) {
						value = fallback(n);
					}
					cyNode.data[dataProperty] = value;
				});
				return cyNode;
			});

		const cytoscapeEdges = edges2ElementDefinitions(primary);

		return [...cytoscapeNodes, ...cytoscapeEdges];
	};

	const node2ImageUri = (type: string | undefined): string | undefined => {
		if (!type) {
			return defaultUri;
		}
		return type2ImageUri[type] || defaultUri;
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

	return [getCytoscapeElementsByEdges] as const;
};
