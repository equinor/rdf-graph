import go from 'gojs';
import { getNodeSymbolTemplate } from '../../../symbol-api';
import { SymbolNodePort, SymbolNodeData, NodeUiType, NodeItemType } from '../types';

export function createSymbolNode(id: string, symbolId: string, label?: string): SymbolNodeData {
	const symbol = getNodeSymbolTemplate(symbolId);

	const ports = symbol.connectors.map<SymbolNodePort>((c) => {
		return {
			type: NodeItemType.SvgSymbolPort,
			position: new go.Point(c.point.x, c.point.y),
			portId: '',
			name: c.id,
			portDirection: c.portDirection,
		};
	});

	const svgDataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(symbol.svg);

	return {
		id: id,
		category: NodeUiType.SvgSymbol,
		label: label,
		symbolId: symbolId,
		symbolPorts: ports,
		svgDataURI: svgDataUri,
		height: symbol.height,
		width: symbol.width,
		angle: 0,
	};
}
