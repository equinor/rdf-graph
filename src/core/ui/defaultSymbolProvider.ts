import { getSymbol, NodeSymbol, SymbolRotation } from '../../symbol-api';
import { UiNodeConnector, UiNodeSymbol } from './uiApplyPatch';

export function NodeSymbolToUiNodeSymbol(symbol: NodeSymbol): UiNodeSymbol {
	return {
		id: symbol.id,
		width: symbol.width,
		height: symbol.height,
		svg: symbol.svg,
		geometry: symbol.geometry,
		connectors: symbol.connectors.map<UiNodeConnector>((c) => {
			return { id: c.id, width: 2, height: 2, direction: c.portDirection, position: { x: c.point.x, y: c.point.y } };
		}, []),
	};
}

export function defaultSymbolProvider(id: string, rotation?: number): UiNodeSymbol | undefined {
	const symbol = getSymbol(id, { rotation: rotation as SymbolRotation });
	if (!symbol) return;
	return NodeSymbolToUiNodeSymbol(symbol);
}
