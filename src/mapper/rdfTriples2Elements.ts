import { ElementDefinition } from 'cytoscape';
import { nanoid } from 'nanoid';
import { rdfObjectKey, rdfPredicateKey, rdfSubjectKey } from '../components/sparqlGraph/cytoscapeDataKeys';
import { DisplayControllingPredicate, RdfTriple } from '../models';
import { NodeType } from '../models/nodeType';
import { getSymbol } from '../symbol-api/getSymbol';
import { onlyUnique, short } from '../utils';

const compoundNodePredicate = 'http://rdf.equinor.com/ui/parent';
const labelPredicate = 'http://www.w3.org/2000/01/rdf-schema#label';
const colorPredicate = 'http://rdf.equinor.com/ui/color';
const hasConnectorPredicate = 'http://rdf.equinor.com/ui/hasConnector';
const hasSvgPredicate = 'http://rdf.equinor.com/ui/hasSvg';
const hasConnectorSuffix = 'http://rdf.equinor.com/ui/hasConnectorSuffix';

const parentDisplayEdge = new DisplayControllingPredicate(compoundNodePredicate, 'parent', true, (o) => o);
const labelDisplayEdge = new DisplayControllingPredicate(labelPredicate, 'label', false, (o) => o);
const colorEdge = new DisplayControllingPredicate(colorPredicate, 'color', false, (o) => o);

const displayEdges = [parentDisplayEdge, labelDisplayEdge, colorEdge];

/* This function is a bit complicated so it deserves a comment*/

export const rdfTriples2Elements = (triples: RdfTriple[]) => {
	const displayPredicate2UiEdges: { [predicate: string]: UiEdge[] } = Object.fromEntries(
		displayEdges.map(({ predicate, mapping }) => [
			predicate,
			triples
				.filter(({ rdfPredicate: type }) => predicate === type)
				.map(({ rdfSubject: from, rdfObject: to }) => new UiEdge(from, mapping(to))),
		])
	);

	const displayNodesEdges = triples.filter(({ rdfPredicate: type }) =>
		displayEdges
			.filter(({ keepNode }) => keepNode)
			.map(({ predicate }) => predicate)
			.includes(type)
	);

	const connector2Suffix: { [connector: string]: string } = Object.fromEntries(
		triples
			.filter(({ rdfPredicate: type }) => type === hasConnectorSuffix)
			.map(({ rdfSubject, rdfObject }) => [rdfSubject /*the connector*/, rdfObject /*the suffix*/])
	);

	const connector2Icon: { [connector: string]: string } = Object.fromEntries(
		triples
			.filter(({ rdfPredicate: type }) => type === hasConnectorPredicate)
			.map(({ rdfSubject, rdfObject }) => [rdfObject /*the connector*/, rdfSubject /*the icon*/])
	);

	const iconNode2Svg: { [iconNode: string]: string } = Object.fromEntries(
		triples
			.filter(({ rdfPredicate: type }) => type === hasSvgPredicate)
			.map(({ rdfSubject, rdfObject }) => [rdfSubject /*the node that requires an image*/, rdfObject /*the svg image*/])
	);

	const primaryEdges = triples.filter(
		({ rdfPredicate: type }) =>
			!displayEdges
				.map(({ predicate }) => predicate)
				.concat([hasConnectorSuffix, hasConnectorPredicate, hasSvgPredicate])
				.includes(type)
	);
	const uiEdges = Object.keys(displayPredicate2UiEdges).flatMap((k) => displayPredicate2UiEdges[k]);
	const uiSubjects = uiEdges.map((uiEdge) => uiEdge.from);

	const connectors = createConnectors(connector2Icon, iconNode2Svg, connector2Suffix);

	const cytoscapeNodes = primaryEdges
		.concat(displayNodesEdges)
		.flatMap((e) => [e.rdfSubject, e.rdfObject])
		.concat(uiSubjects)
		.filter(onlyUnique)
		.filter((n) => !connectors.map((c) => c.data.id).includes(n))
		.flatMap((n) => {
			const cyNode: ElementDefinition = { data: { id: n } };

			displayEdges.forEach(({ predicate, dataProperty }) => {
				const value = displayPredicate2UiEdges[predicate].find(({ from }) => from === n)?.to;
				if (value) {
					cyNode.data[dataProperty] = value;
				}
			});

			if (Object.keys(iconNode2Svg).includes(n)) {
				const symbolId = iconNode2Svg[n];
				const symbol = getSymbol(symbolId);

				const symbolNode: ElementDefinition = {
					data: {
						id: `${n}-symbol`,
						parent: n,
						nodeType: NodeType.SymbolImage,
						image: symbol.svgDataURI(),
						layoutIgnore: true,
						imageHeight: `${symbol.height}px`,
						imageWidth: `${symbol.width}px`,
					},
				};

				cyNode.data.layoutIgnore = false;
				cyNode.data.nodeType = NodeType.SymbolContainer;
				//cyNode.data.imageHeight = `${symbol.height}px`;
				//cyNode.data.imageWidth = `${symbol.width}px`;
				cyNode.data.rotation = 0;

				console.log('Got image node ', cyNode);
				return [cyNode, symbolNode];
			}
			return [cyNode];
		})
		.concat(connectors);

	const cytoscapeEdges = primaryEdges.map(edge2CytoscapeEdge);

	return [...cytoscapeNodes, ...cytoscapeEdges];
};

const createConnectors = (
	connector2IconNode: { [connector: string]: string },
	iconNode2Svg: { [iconNode: string]: string },
	connector2Suffix: { [connector: string]: string }
): ElementDefinition[] => {
	return Object.keys(connector2IconNode).map((connectorId) => {
		const iconNode = connector2IconNode[connectorId];
		const svgId = iconNode2Svg[iconNode];
		const svg = getSymbol(svgId);
		const suffix = connector2Suffix[connectorId];
		let connectorData = svg.connectors.find((c) => c.id === suffix);
		if (!connectorData) {
			console.error(`Cannot find connector ${suffix} for svg ${svgId}`);
			connectorData = {
				id: suffix,
				point: { x: 0, y: 0 },
			};
		}

		const connectorNode = {
			data: {
				id: connectorId,
				parent: connector2IconNode[connectorId],
				nodeType: NodeType.SymbolConnector,
				layoutIgnore: true,
			},
			position: connectorData.point,
			grabbable: false,
			selectable: false,
		};
		console.log('Connector', connectorNode);
		return connectorNode;
	});
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

class UiEdge {
	constructor(from: string, to: string | undefined) {
		this.from = from;
		this.to = to;
	}

	from: string;
	to: string | undefined;
}
