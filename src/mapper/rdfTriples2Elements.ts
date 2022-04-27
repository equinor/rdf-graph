import { ElementDefinition } from 'cytoscape';
import { nanoid } from 'nanoid';
import { rdfObjectKey, rdfPredicateKey, rdfSubjectKey } from '../components/sparqlGraph/cytoscapeDataKeys';
import { DisplayControllingPredicate, RdfTriple } from '../models';
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
const svgEdge = new DisplayControllingPredicate(
	hasSvgPredicate,
	'image',
	false,
	(o) => 'data:image/svg+xml;utf8,' + encodeURIComponent(iconLibMock(o!).svg)
);

const displayEdges = [parentDisplayEdge, labelDisplayEdge, colorEdge, svgEdge];

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

	const connector2Suffix: { [connector: string]: string } = Object.fromEntries(
		edges
			.filter(({ rdfPredicate: type }) => type === hasConnectorSuffix)
			.map(({ rdfSubject, rdfObject }) => [rdfSubject /*the connector*/, rdfObject /*the suffix*/])
	);

	const connector2Icon: { [connector: string]: string } = Object.fromEntries(
		edges
			.filter(({ rdfPredicate: type }) => type === hasConnectorPredicate)
			.map(({ rdfSubject, rdfObject }) => [rdfObject /*the connector*/, rdfSubject /*the icon*/])
	);

	const iconNode2Svg: { [iconNode: string]: string } = Object.fromEntries(
		edges
			.filter(({ rdfPredicate: type }) => type === hasSvgPredicate)
			.map(({ rdfSubject, rdfObject }) => [rdfSubject /*the node that requires an image*/, rdfObject /*the svg image*/])
	);

	const primaryEdges = edges.filter(
		({ rdfPredicate: type }) =>
			!displayEdges
				.map(({ predicate }) => predicate)
				.concat([hasConnectorSuffix, hasConnectorPredicate])
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
		.map((n) => {
			const cyNode: ElementDefinition = { data: { id: n } };
			displayEdges.forEach(({ predicate, dataProperty }) => {
				const value = displayPredicate2UiEdges[predicate].find(({ from }) => from === n)?.to;
				if (value) {
					cyNode.data[dataProperty] = value;
				}
			});
			return cyNode;
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
		const svg = iconLibMock(svgId);
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
				nodeType: 'connector',
			},
			position: connectorData.point,
			grabbable: false,
			selectable: false,
		};
		return connectorNode;
	});
};

interface Point {
	x: number;
	y: number;
}

interface Connector {
	id: string;
	point: Point;
}

const iconLibMock = (svgId: string): { svg: string; connectors: Connector[] } => {
	if (svgId === 'seperator') {
		return {
			svg: `<?xml version="1.0" standalone="no"?>
				<svg width="48" height="140" fill="none" viewBox="0 0 48 140" xmlns="http://www.w3.org/2000/svg">
				<path d="M42.6311 24.0867V116.87" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
				<path d="M42.6313 116.848H5.35792" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
				<path d="M42.6475 24.0654H5.37403" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
				<path d="M5.39038 24.0646L5.39038 116.848" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
				<path d="M5.36579 23.8603C5.769 22.6021 6.54636 21.3642 7.65347 20.2172C8.76058 19.0702 10.1758 18.0365 11.8182 17.1753C13.4607 16.314 15.2982 15.642 17.226 15.1976C19.1537 14.7532 21.1338 14.5451 23.0534 14.5853" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
				<path d="M42.635 23.86C41.5073 21.419 38.8108 19.0706 35.1387 17.3314C31.4666 15.5922 27.1197 14.6046 23.054 14.5859" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
				<path d="M42.6342 117.14C42.231 118.398 41.4536 119.636 40.3465 120.783C39.2394 121.93 37.8242 122.963 36.1818 123.825C34.5393 124.686 32.7018 125.358 30.774 125.802C28.8463 126.247 26.8661 126.455 24.9466 126.415" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
				<path d="M5.36548 117.14C6.49324 119.581 9.18972 121.93 12.8618 123.669C16.5339 125.408 20.8809 126.396 24.9466 126.414" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
				<path d="M5.36963 46.0665L42.5692 46.053" stroke="black" stroke-miterlimit="3" stroke-linecap="square" stroke-dasharray="0.22 0.22"/>
				<path d="M5.34961 92.2789L42.5491 92.2654" stroke="black" stroke-miterlimit="3" stroke-linecap="square" stroke-dasharray="0.22 0.22"/>

				<line x1="23.5" y1="15" x2="23.5" y2="-3.0036e-08" stroke="black"/>
				<line x1="24.5" y1="142" x2="24.5" y2="127" stroke="black"/>
				<line x1="4.5" y1="36.5" x2="0.5" y2="36.5" stroke="black" stroke-linecap="square"/>

				</svg>`,
			connectors: [
				{ id: 'c1', point: { x: 0.5, y: 6.5 } },
				{ id: 'c2', point: { x: 23.5, y: 0 } },
				{ id: 'c3', point: { x: 24.5, y: 140 } },
			],
		};
	}
	if (svgId === 'valve') {
		return {
			svg: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
				<g id="Symbol 2">
				<g id="Group">
				<g id="shape1406-1">
				<path id="Vector" fill-rule="evenodd" clip-rule="evenodd" d="M3 34L24 23.5L3 13V34Z" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
				</g>
				<g id="shape1412-3">
				<path id="Vector_2" fill-rule="evenodd" clip-rule="evenodd" d="M45 13L24 23.5L45 34V13Z" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
				</g>
				<g id="shape1421-5">
				<path id="Vector_3" d="M24 13V34" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
				</g>
				<circle id="Connector1" cx="2.5" cy="23.5" r="0.5" fill="#EB0000"/>
				<circle id="Connector2" cx="45.5" cy="23.5" r="0.5" fill="#EB0000"/>
				</g>
				</g>
				</svg>
				`,
			connectors: [
				{ id: 'c1', point: { x: 0.5, y: 6.5 } },
				{ id: 'c2', point: { x: 23.5, y: 0 } },
			],
		};
	}

	return {
		svg: `<?xml version="1.0" standalone="no"?>
			<svg width="48" height="140" fill="none" viewBox="0 0 48 140" xmlns="http://www.w3.org/2000/svg">
			<path d="M42.6311 24.0867V116.87" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
			<path d="M42.6313 116.848H5.35792" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
			<path d="M42.6475 24.0654H5.37403" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
			<path d="M5.39038 24.0646L5.39038 116.848" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
			<path d="M5.36579 23.8603C5.769 22.6021 6.54636 21.3642 7.65347 20.2172C8.76058 19.0702 10.1758 18.0365 11.8182 17.1753C13.4607 16.314 15.2982 15.642 17.226 15.1976C19.1537 14.7532 21.1338 14.5451 23.0534 14.5853" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
			<path d="M42.635 23.86C41.5073 21.419 38.8108 19.0706 35.1387 17.3314C31.4666 15.5922 27.1197 14.6046 23.054 14.5859" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
			<path d="M42.6342 117.14C42.231 118.398 41.4536 119.636 40.3465 120.783C39.2394 121.93 37.8242 122.963 36.1818 123.825C34.5393 124.686 32.7018 125.358 30.774 125.802C28.8463 126.247 26.8661 126.455 24.9466 126.415" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
			<path d="M5.36548 117.14C6.49324 119.581 9.18972 121.93 12.8618 123.669C16.5339 125.408 20.8809 126.396 24.9466 126.414" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
			<path d="M5.36963 46.0665L42.5692 46.053" stroke="black" stroke-miterlimit="3" stroke-linecap="square" stroke-dasharray="0.22 0.22"/>
			<path d="M5.34961 92.2789L42.5491 92.2654" stroke="black" stroke-miterlimit="3" stroke-linecap="square" stroke-dasharray="0.22 0.22"/>

			<line x1="23.5" y1="15" x2="23.5" y2="-3.0036e-08" stroke="black"/>
			<line x1="24.5" y1="142" x2="24.5" y2="127" stroke="black"/>
			<line x1="4.5" y1="36.5" x2="0.5" y2="36.5" stroke="black" stroke-linecap="square"/>

			</svg>`,
		connectors: [
			{ id: 'c1', point: { x: 0.5, y: 6.5 } },
			{ id: 'c2', point: { x: 23.5, y: 0 } },
			{ id: 'c3', point: { x: 24.5, y: 140 } },
		],
	};
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
