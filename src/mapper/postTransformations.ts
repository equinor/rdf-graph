import cytoscape, { ElementDefinition } from 'cytoscape';
import { NodeType } from '../models/nodeType';
import { getSymbol } from '../symbol-api/getSymbol';
import { NodeSymbol } from '../symbol-api/types/NodeSymbol';
import { SymbolRotation } from '../symbol-api/types/SymbolRotation';
import { postProcessSvgTag } from './transformations';

export type Transformation = {
	transformNew: (element: ElementDefinition) => ElementDefinition[];
	transformUpdate: (element: ElementDefinition, cy: cytoscape.Core) => void;
};

export const createSvgTransformation = (iconNode2Connectors: { [iconNode: string]: ElementDefinition[] }): Transformation => {
	const transform = (element: ElementDefinition) => {
		const rotation = parseInt(element.data.rotation) as SymbolRotation;
		const symbol = getSymbol(element.data.symbolId, { rotation: rotation });

		const parentNode: ElementDefinition = {
			data: {
				...element.data,
				imageHeight: `${symbol.height}px`,
				imageWidth: `${symbol.width}px`,
				[postProcessSvgTag]: false,
			},
		};

		const children = iconNode2Connectors[element.data.id!];

		const connectorElements = children
			.filter((child) => child.data.nodeType === NodeType.SymbolConnector)
			.map((child) => {
				return {
					data: child.data,
					position: symbol.connectors.find((c) => c.id === child.data.connectorId)?.point,
					grabbable: false,
					selectable: false,
				};
			});
		return [parentNode, createSymbolNode(element.data.id!, symbol), ...connectorElements];
	};

	const update = (newElement: ElementDefinition, cy: cytoscape.Core) => {
		const oldElement = cy.elements(`[id = "${newElement.data.id}"]`)[0];
		if (oldElement) {
			const combinedData = Object.assign({}, oldElement.data(), newElement.data);
			const symbol = createSymbol(combinedData);
			const symbolNode = oldElement.children(`[nodeType = "${NodeType.SymbolImage}"]`)[0];
			if (symbolNode) {
				symbolNode.data('image', symbol.svgDataURI());
				symbolNode.data('imageHeight', `${symbol.height}px`);
				symbolNode.data('imageWidth', `${symbol.width}px`);
			} else {
				const newSymbolNode = createSymbolNode(newElement.data.id!, symbol);
				cy.add(newSymbolNode);
			}
			const connectorNodes = oldElement.children(`[nodeType = "${NodeType.SymbolConnector}"]`);
			if (connectorNodes) {
				const cnPos = oldElement.position();
				for (let i = 0; i < symbol.connectors.length; i++) {
					const element = symbol.connectors[i];
					connectorNodes[i].position('x', element.point.x + cnPos.x);
					connectorNodes[i].position('y', element.point.y + cnPos.y);
				}
			}
		} else {
		}
	};
	return { transformNew: transform, transformUpdate: update };
};

const createSymbolNode = (parentId: string, symbol: NodeSymbol): ElementDefinition => {
	return {
		data: {
			id: `${parentId}-symbol`,
			parent: parentId,
			nodeType: NodeType.SymbolImage,
			layoutIgnore: true,
			image: symbol.svgDataURI(),
			imageHeight: `${symbol.height}px`,
			imageWidth: `${symbol.width}px`,
		},
		position: { x: 0, y: 0 },
		grabbable: false,
		selectable: false,
	};
};

const createSymbol = (data: any): NodeSymbol => {
	const rotation = (parseInt(data.rotation) ?? 0) as SymbolRotation;
	return getSymbol(data.symbolId, { rotation: rotation });
};
