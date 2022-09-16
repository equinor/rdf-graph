import { getConnectorSymbolAdvanced, SymbolLibraryKey } from '../../symbol-api';
import { ConnectorSymbol } from '../types';
import { UiNodeConnector, UiNodeSymbol } from './applyPatch';

export function ConnectorSymbolToUiNodeSymbol(symbol: ConnectorSymbol): UiNodeSymbol {
	return {
		id: symbol.id,
		width: symbol.width,
		height: symbol.height,
		svg: symbol.svgString,
		geometry: symbol.geometryString,
		connectors: symbol.connectors.map<UiNodeConnector>((c) => {
			return { id: c.id, width: 2, height: 2, direction: c.direction, position: { x: c.relativePosition.x, y: c.relativePosition.y } };
		}, []),
	};
}

export function defaultSymbolProvider(id: string, rotation?: number): UiNodeSymbol | undefined {
	const symbol = getConnectorSymbolAdvanced(id as SymbolLibraryKey, { rotation: rotation });
	if (!symbol) return;
	console.log(ConnectorSymbolToUiNodeSymbol(symbol));
	return ConnectorSymbolToUiNodeSymbol(symbol);
}
