import { stringToSvgElement } from './svg-manipulation';
import { SymbolLibrary, SymbolKey } from './symbol-library';
import { NodeSymbol, NodeSymbolTemplate } from './types/NodeSymbol';
import { NodeSymbolConnector, PortDirection } from './types/NodeSymbolConnector';
import { SymbolOptions } from './types/SymbolOptions';
import { pointToCenterCenter, rotatePoint } from './utils/point-utils';

export function getSymbol(id: string, options?: SymbolOptions): NodeSymbol {
	if (!(id in SymbolKey)) throw new TypeError(`Symbol with id '${id}' does not exist.`);

	const symbol = SymbolLibrary[id as keyof typeof SymbolKey];

	const rotation = options?.rotation ?? 0;
	const height = options?.height ?? symbol.height;
	const width = options?.width ?? symbol.width;

	const svgEl = stringToSvgElement(symbol.svg);
	const connectors: NodeSymbolConnector[] = [];

	symbol.connectors.forEach((c) => {
		let p = pointToCenterCenter(c.point, width, height);
		if (rotation > 0) {
			p = rotatePoint(p, rotation);
		}
		// TODO: Not implemented PortBearing !!
		connectors.push(new NodeSymbolConnector(c.id, p, PortDirection.N));
	});

	if (rotation > 0) {
		svgEl.setAttribute('transform', `rotate(${rotation})`);
	}

	return new NodeSymbol(id, svgEl.outerHTML, width, height, connectors);
}

export function getNodeSymbolTemplate(id: string): NodeSymbolTemplate {
	return SymbolLibrary[id as keyof typeof SymbolKey];
}
