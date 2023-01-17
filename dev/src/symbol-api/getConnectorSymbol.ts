import { stringToSvgElement } from './utils/svg-manipulation';
import { pointToCenterCenter, rotatePoint } from './utils/point-utils';
import symbolLib from './symbol-library/symbol-library.json';
import { SymbolLibraryKey } from './symbol-library/symbol-library.types';
import { SymbolOptions, UiSymbol } from '@rdf-graph/core';

export const symbolLibrary = symbolLib as Record<SymbolLibraryKey, Readonly<UiSymbol>>;

function cloneConnectorSymbol(symbol: UiSymbol): UiSymbol {
	const clone: UiSymbol = { ...symbol, connectors: [] };
	for (let i = 0; i < symbol.connectors.length; i++) {
		let c = symbol.connectors[i];
		clone.connectors.push({
			...c,
			position: { ...c.position },
		});
	}
	return clone;
}

export function getConnectorSymbol(id: SymbolLibraryKey): UiSymbol | undefined {
	return id in symbolLibrary ? cloneConnectorSymbol(symbolLibrary[id]) : undefined;
}

/** Get mutated Connector Symbol using mutation options */
export function getConnectorSymbolAdvanced(
	id: SymbolLibraryKey,
	options?: SymbolOptions
): UiSymbol | undefined {
	const symbol = getConnectorSymbol(id);
	if (!symbol) return undefined;

	const mutRotation = options?.mutateSvgStringOnRotation ?? false;
	const mutRelPos = options?.mutateConnectorRelativePosition ?? 'none';
	const mutRelPosRot = options?.mutateConnectorRelativePositionOnRotation ?? false;

	if (mutRelPos === 'none' && mutRotation === false && mutRelPosRot === false) return symbol;

	const rotation = options?.rotation ?? 0;
	const height = options?.height ?? symbol.height;
	const width = options?.width ?? symbol.width;

	symbol.width = width;
	symbol.height = height;

	if (mutRotation && rotation > 0) {
		const svgEl = stringToSvgElement(symbol.svg);
		svgEl.setAttribute('transform', `rotate(${rotation})`);
		symbol.svg = svgEl.outerHTML;
	}

	if (mutRelPos === 'none' && mutRelPosRot === false) return symbol;

	for (let i = 0; i < symbol.connectors.length; i++) {
		const c = symbol.connectors[i];
		let p = c.position;

		if (mutRelPos === 'CenterCenter')
			p = pointToCenterCenter({ x: c.position.x, y: c.position.y }, width, height);

		if (mutRelPosRot && rotation > 0) {
			p = rotatePoint(p, rotation);
		}

		c.position.x = p.x;
		c.position.y = p.y;
	}

	return symbol;
}
