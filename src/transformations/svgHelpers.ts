import { ElementDefinition, Position } from 'cytoscape';
import { hasSvgPredicate, rotationPredicate } from '../mapper/predicates';
import { getData } from '../models/cytoscapeApi';
import { RdfNodeDataDefinition } from '../models/cytoscapeApi.types';
import { NodeType } from '../models/nodeType';
import { getSymbol, NodeSymbol, SymbolRotation } from '../symbol-api';

export const getPosition = (symbol: NodeSymbol, parentPosition: Position, connectorId: string) => {
	const relativePosition = symbol.connectors.find((c) => c.id === connectorId)!.point;
	return {
		x: relativePosition!.x + parentPosition.x,
		y: relativePosition!.y + parentPosition.y,
	};
};

export const createSymbolNode = (mainNodeId: string, symbol: NodeSymbol, position: Position): ElementDefinition => {
	return {
		data: {
			id: createSymbolNodeId(mainNodeId),
			parent: mainNodeId,
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

export const createSymbolNodeId = (mainNodeId: string) => `${mainNodeId}-symbol`;

export const createSymbol = (data: RdfNodeDataDefinition): NodeSymbol => {
	const rotation = parseInt(getData(data, rotationPredicate.value) ?? '0') as SymbolRotation;
	return getSymbol(getData(data, hasSvgPredicate.value)!, { rotation: rotation });
};
