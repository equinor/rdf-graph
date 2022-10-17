import { stringToSvgElement } from './utils/svg-manipulation';
import { pointToCenterCenter, rotatePoint } from './utils/point-utils';
import { ConnectorSymbol, SymbolOptions } from '../core/types';
import symbolLib from './symbol-library/symbol-library.json';
import { SymbolLibraryKey } from './symbol-library/symbol-library.types';

export const symbolLibrary = symbolLib as Record<
	SymbolLibraryKey,
	Readonly<ConnectorSymbol>
>;

function cloneConnectorSymbol(symbol: ConnectorSymbol): ConnectorSymbol {
	const clone: ConnectorSymbol = { ...symbol, connectors: [] };
	for (let i = 0; i < symbol.connectors.length; i++) {
		let c = symbol.connectors[i];
		clone.connectors.push({
			...c,
			relativePosition: { x: c.relativePosition.x, y: c.relativePosition.y },
		});
	}
	return clone;
}

export function getConnectorSymbol(
	id: SymbolLibraryKey
): ConnectorSymbol | undefined {
	return id in symbolLibrary
		? cloneConnectorSymbol(symbolLibrary[id])
		: undefined;
}

/** Get mutated Connector Symbol using mutation options */
export function getConnectorSymbolAdvanced(
	id: SymbolLibraryKey,
	options?: SymbolOptions
): ConnectorSymbol | undefined {
	const symbol = getConnectorSymbol(id);
	if (!symbol) return undefined;

	const mutRotation = options?.mutateSvgStringOnRotation ?? false;
	const mutRelPos = options?.mutateConnectorRelativePosition ?? 'none';
	const mutRelPosRot =
		options?.mutateConnectorRelativePositionOnRotation ?? false;

	if (mutRelPos === 'none' && mutRotation === false && mutRelPosRot === false)
		return symbol;

	const rotation = options?.rotation ?? 0;
	const height = options?.height ?? symbol.height;
	const width = options?.width ?? symbol.width;

	symbol.width = width;
	symbol.height = height;

	if (mutRotation && rotation > 0) {
		const svgEl = stringToSvgElement(symbol.svgString);
		svgEl.setAttribute('transform', `rotate(${rotation})`);
		symbol.svgString = svgEl.outerHTML;
	}

	if (mutRelPos === 'none' && mutRelPosRot === false) return symbol;

	for (let i = 0; i < symbol.connectors.length; i++) {
		const c = symbol.connectors[i];
		let p = c.relativePosition;

		if (mutRelPos === 'CenterCenter')
			p = pointToCenterCenter(
				{ x: c.relativePosition.x, y: c.relativePosition.y },
				width,
				height
			);

		if (mutRelPosRot && rotation > 0) {
			p = rotatePoint(p, rotation);
		}

		c.relativePosition.x = p.x;
		c.relativePosition.y = p.y;
	}

	return symbol;
}
