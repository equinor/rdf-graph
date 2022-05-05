import { ElementDefinition } from 'cytoscape';
import { nanoid } from 'nanoid';
import { rdfObjectKey, rdfPredicateKey, rdfSubjectKey } from '../components/sparqlGraph/cytoscapeDataKeys';
import { RdfTriple } from '../models';
import { NodeType } from '../models/nodeType';
import { getSymbol } from '../symbol-api/getSymbol';
import { short } from '../utils';

export type Transformation = (triple: RdfTriple) => ElementDefinition[];

export const defaultTransformation = (triple: RdfTriple) => {
	const { rdfSubject, rdfPredicate, rdfObject } = triple;
	let edgeElement: ElementDefinition = {
		data: {
			source: triple.rdfSubject,
			target: triple.rdfObject,
			id: nanoid(),
			label: short(triple.rdfPredicate),
			[rdfSubjectKey]: rdfSubject,
			[rdfPredicateKey]: rdfPredicate,
			[rdfObjectKey]: rdfObject,
		},
	};

	return [{ data: { id: rdfSubject } }, { data: { id: rdfObject } }, edgeElement];
};

export const createPropertyTransform = (cyKey: string): Transformation => {
	const transformation = (triple: RdfTriple): ElementDefinition[] => {
		const { rdfSubject, rdfObject } = triple;
		let node: ElementDefinition = { data: { id: rdfSubject } };
		node.data[cyKey] = rdfObject;
		return [node];
	};
	return transformation;
};

export const hasConnectorTransform = (triple: RdfTriple): ElementDefinition[] => {
	return [
		{
			data: {
				id: triple.rdfObject, //HasConnector means object is connector
				parent: triple.rdfSubject, //HasConnector means subject is the node that will have an svg
			},
		},
	];
};

export const hasSvgTransform = (triple: RdfTriple): ElementDefinition[] => {
	const symbol = getSymbol(triple.rdfObject); //HasSvg means object is svgId

	const symbolNode: ElementDefinition = {
		data: {
			id: `${triple.rdfSubject}-symbol`,
			parent: triple.rdfSubject,
			nodeType: NodeType.SymbolImage,
			image: symbol.svgDataURI(),
			layoutIgnore: true,
			imageHeight: `${symbol.height}px`,
			imageWidth: `${symbol.width}px`,
		},
	};

	const parent: ElementDefinition = {
		data: {
			id: triple.rdfSubject,
			layoutIgnore: false,
			nodeType: NodeType.SymbolContainer,
			rotation: 0,
		},
	};
	return [symbolNode, parent];
};

export const createConnectorTransform = (
	connector2IconNode: { [connector: string]: string },
	iconNode2Svg: { [iconNode: string]: string }
): Transformation => {
	const transformation = (triple: RdfTriple): ElementDefinition[] => {
		const iconNode = connector2IconNode[triple.rdfSubject]; // subject is connector
		const svgId = iconNode2Svg[iconNode];
		const svg = getSymbol(svgId);
		let connectorData = svg.connectors.find((c) => c.id === triple.rdfObject); //object is a string identifying connector inside svg
		if (!connectorData) {
			console.error(`Cannot find connector ${triple.rdfObject} for svg ${svgId}`);
			connectorData = {
				id: triple.rdfObject,
				point: { x: 0, y: 0 },
			};
		}
		const connectorNode = {
			data: {
				id: triple.rdfSubject,
				parent: connector2IconNode[triple.rdfSubject],
				nodeType: NodeType.SymbolConnector,
				layoutIgnore: true,
			},
			position: connectorData.point,
			grabbable: false,
			selectable: false,
		};
		return [connectorNode];
	};
	return transformation;
};
