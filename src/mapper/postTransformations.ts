import { ElementDefinition } from 'cytoscape';
import { NodeType } from '../models/nodeType';
import { getSymbol } from '../symbol-api/getSymbol';
import { SymbolRotation } from '../symbol-api/types/SymbolRotation';
import { postProcessSvgTag } from './transformations';

export type PostTransformation = (element: ElementDefinition) => ElementDefinition[];

export const createSvgTransformation = (iconNode2Connectors: { [iconNode: string]: ElementDefinition[] }) => {
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

		const symbolNode: ElementDefinition = {
			data: {
				id: `${element.data.id}-symbol`,
				parent: element.data.id,
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
		return [parentNode, symbolNode, ...connectorElements];
	};
	return transform;
};
