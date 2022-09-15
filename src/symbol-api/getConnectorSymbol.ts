import { stringToSvgElement } from './utils/svg-manipulation';
import { pointToCenterCenter, rotatePoint } from './utils/point-utils';
import { ConnectorSymbol, SymbolOptions } from '../core/types';
import symbolLibrary from './symbol-library.json';

export const symbolLib = symbolLibrary as Record<string, Readonly<ConnectorSymbol>>;

function cloneConnectorSymbol(symbol: ConnectorSymbol): ConnectorSymbol {
	const clone: ConnectorSymbol = { ...symbol, connectors: [] };
	for (let i = 0; i < symbol.connectors.length; i++) {
		let c = symbol.connectors[i];
		clone.connectors.push({ ...c, relativePosition: { x: c.relativePosition.x, y: c.relativePosition.y } });
	}
	return clone;
}

export function getConnectorSymbol(id: string): ConnectorSymbol | undefined {
	return id in symbolLib ? cloneConnectorSymbol(symbolLib[id]) : undefined;
}

export function getConnectorSymbolAdvanced(id: string, options?: SymbolOptions): ConnectorSymbol | undefined {
	if (!(id in symbolLib)) return undefined;

	const symbol: ConnectorSymbol = cloneConnectorSymbol(symbolLib[id]);

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
		const svgEl = stringToSvgElement(symbol.svgString);
		svgEl.setAttribute('transform', `rotate(${rotation})`);
		symbol.svgString = svgEl.outerHTML;
	}

	if (mutRelPos === 'none' && mutRelPosRot === false) return symbol;

	for (let i = 0; i < symbol.connectors.length; i++) {
		const c = symbol.connectors[i];
		let p = pointToCenterCenter({ x: c.relativePosition.x, y: c.relativePosition.y }, width, height);
		if (rotation > 0) {
			p = rotatePoint(p, rotation);
		}

		c.relativePosition.x = p.x;
		c.relativePosition.y = p.y;
	}

	return symbol;
}

export function getConnectorSymbolSvgDataURI(id: string, options?: SymbolOptions): string | undefined {
	if (!(id in symbolLib)) return undefined;

	// We do not need to clone the symbol because we only read the
	// svgString
	const symbol: ConnectorSymbol = symbolLib[id];

	const fill = options?.fill ?? 'none';
	const stroke = options?.stroke ?? 'black';

	const svgEl = stringToSvgElement(symbol.svgString);

	if (options?.fill) {
		svgEl.setAttribute('fill', fill);
	}

	if (options?.stroke) {
		svgEl.setAttribute('stroke', stroke);
	}

	return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgEl.outerHTML);
}
