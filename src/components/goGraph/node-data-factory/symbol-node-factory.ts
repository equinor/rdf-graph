import go from 'gojs';
import { getNodeSymbolTemplate } from '../../../symbol-api';
import { SymbolNodeData, PortData, NodeUiItemCategory, NodeUiCategory } from '../types';

export function createSymbolNodeData(id: string, symbolId: string, label?: string): SymbolNodeData {
	const symbol = getNodeSymbolTemplate(symbolId);

	const ports = symbol.connectors.map<PortData>((c) => {
		return {
			category: NodeUiItemCategory.PositionPort,
			relativePosition: new go.Point(c.point.x, c.point.y),
			portId: '',
			name: c.id,
			direction: c.portDirection,
			height: 2,
			width: 2,
		};
	});

	const svgDataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(symbol.svg);

	return {
		id: id,
		category: NodeUiCategory.SvgSymbol,
		label: label,
		symbolId: symbolId,
		ports: ports,
		svgDataURI: svgDataUri,
		height: symbol.height,
		width: symbol.width,
		angle: 0,
	};
}
