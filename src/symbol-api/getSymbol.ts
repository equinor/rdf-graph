import { stringToSvgElement } from './svg-manipulation';
import { SymbolLibrary, SymbolKey } from './symbol-library';
import { NodeSymbol } from './types/NodeSymbol';
import { NodeSymbolConnector } from './types/NodeSymbolConnector';
import { SymbolOptions } from './types/SymbolOptions';
import { pointToCenterCenter, rotatePoint } from './utils/point-utils';

export function getSymbol(id: string, options?: SymbolOptions): NodeSymbol {
	if (!(id in SymbolKey)) throw new TypeError(`Symbol with id '${id}' does not exist.`);

	const symbol = SymbolLibrary[id as keyof typeof SymbolKey];

	// TODO: validate options?

	const rotation = options?.rotation ?? 0;
	const color = options?.color ?? 'grey';
	const height = options?.height ?? symbol.height;
	const width = options?.width ?? symbol.width;

	const svgEl = stringToSvgElement(symbol.svg);

	//svgEl.style.stroke = color;

	const connectors: NodeSymbolConnector[] = [];

	symbol.connectors.forEach((c) => {
		let p = pointToCenterCenter(c.point, width, height);
		if (rotation > 0) {
			p = rotatePoint(p, rotation);
		}

		connectors.push(new NodeSymbolConnector(c.id, p));
	});

	if (rotation > 0) {
		//svgEl.style.transform = `rotate(${rotation})`;
		svgEl.setAttribute('transform', `rotate(${rotation})`);
	}

	return new NodeSymbol(id, svgEl.outerHTML, width, height, connectors);
}
