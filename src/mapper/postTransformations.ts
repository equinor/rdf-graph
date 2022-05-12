import cytoscape, { ElementDefinition, Position } from 'cytoscape';
import { NodeType } from '../models/nodeType';
import { getSymbol } from '../symbol-api/getSymbol';
import { NodeSymbol } from '../symbol-api/types/NodeSymbol';
import { SymbolRotation } from '../symbol-api/types/SymbolRotation';
import { arrayEquals } from '../utils/arrayEquals';
import { mergeElementsByKey } from './mergeElements';
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
		return [parentNode, createSymbolNode(element.data.id!, symbol, { x: 0, y: 0 }), ...connectorElements];
	};

	const update = (newElement: ElementDefinition, cy: cytoscape.Core) => {
		const id = newElement.data.id!;
		const oldElement = cy.elements(`[id = "${newElement.data.id}"]`)?.[0];
		const oldSymbolNode = oldElement?.children(`[nodeType = "${NodeType.SymbolImage}"]`)?.[0];
		const oldConnectors = oldElement?.children(`[nodeType = "${NodeType.SymbolConnector}"]`);
		const oldConnectorElements = oldConnectors.map((c) => {
			return { data: c.data() };
		});
		const newConnectors = iconNode2Connectors[id] ?? [];
		const combinedData = Object.assign({}, oldElement.data(), newElement.data);

		console.log(
			'Merging ',
			oldConnectorElements.map((e) => e.data)
		);
		console.log(
			'with ',
			newConnectors.map((e) => e.data)
		);

		const elementConnectors = mergeElementsByKey(oldConnectorElements.concat(newConnectors));
		const elementConnectorIds = elementConnectors.map((c) => c.data.connectorId);

		const symbol = createSymbol(combinedData);
		const symbolConnectorIds = symbol.connectors.map((c) => c.id);

		if (!arrayEquals(elementConnectorIds, symbolConnectorIds)) {
			throw new TurtleGraphError(
				`Unable to match connectors from ${id}[${elementConnectorIds.join(', ')}] with connectors from symbol ${
					symbol.id
				}[${symbolConnectorIds.join(', ')}]`
			);
		}

		const position = oldElement ? oldElement.position() : { x: 0, y: 0 };

		if (oldSymbolNode) {
			oldSymbolNode.data('image', symbol.svgDataURI());
			oldSymbolNode.data('imageHeight', `${symbol.height}px`);
			oldSymbolNode.data('imageWidth', `${symbol.width}px`);
		} else {
			const newSymbolNode = createSymbolNode(id, symbol, position);
			cy.add(newSymbolNode);
		}

		for (let i = 0; i < newConnectors.length; i++) {
			cy.add({
				data: newConnectors[i].data,
				position: getPosition(symbol, position, newConnectors[i].data.connectorId),
				grabbable: false,
			});
		}

		for (let i = 0; i < oldConnectors.length; i++) {
			const p = getPosition(symbol, position, oldConnectors[i].data('connectorId'));
			oldConnectors[i].position('x', p.x);
			oldConnectors[i].position('y', p.y);
		}
	};
	return { transformNew: transform, transformUpdate: update };
};

class TurtleGraphError extends Error {
	constructor(msg: string) {
		super(msg);
		Object.setPrototypeOf(this, TurtleGraphError.prototype);
	}
}

const getPosition = (symbol: NodeSymbol, parentPosition: Position, connectorId: string) => {
	const relativePosition = symbol.connectors.find((c) => c.id === connectorId)!.point;
	return {
		x: relativePosition!.x + parentPosition.x,
		y: relativePosition!.y + parentPosition.y,
	};
};

const createSymbolNode = (parentId: string, symbol: NodeSymbol, position: Position): ElementDefinition => {
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
		position: position,
		grabbable: false,
		selectable: false,
	};
};

const createSymbol = (data: any): NodeSymbol => {
	const rotation = (parseInt(data.rotation) ?? 0) as SymbolRotation;
	return getSymbol(data.symbolId, { rotation: rotation });
};
