import go from 'gojs';
import { SymbolKey, SymbolLibrary } from '../symbol-api/symbol-library';
import { NodeSymbolTemplate } from '../symbol-api/types/NodeSymbol';
import { PortBearing } from '../symbol-api/types/NodeSymbolConnector';

function getSymbol(id: string): NodeSymbolTemplate {
	// SymbolLibrary[id as keyof typeof SymbolKey];
	return SymbolLibrary[id as keyof typeof SymbolKey];
}

export function createSymbolNode(key: number, symbolId: string) {
	const symbol = getSymbol(symbolId);

	const ports = symbol.connectors.map((c) => {
		return {
			type: 'symbolPort',
			position: new go.Point(c.point.x, c.point.y),
			portId: c.id,
			portBearing: c.portBearing,
		};
	});

	const svgDataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(symbol.svg);

	const img = new Image();
	img.src = svgDataUri;
	img.height = symbol.height;
	img.width = symbol.width;

	//console.log(img.outerHTML);

	console.log(10, ports, symbol.height);

	return {
		key: key,
		symbolId: symbolId,
		height: symbol.height,
		width: symbol.width,
		angle: 0,
		category: 'symbolWithPorts',
		symbolPorts: ports,
		svgImageElement: svgDataUri,
		svgDataURI: svgDataUri,
	};
}

export function createRectangleNode(key: number, portsAmount: number, text: string, background = '#FF5733') {
	// const symbol = getSymbol(symbolId);

	let ports = [];
	const step = 25;
	const height = 200;
	const width = '';

	for (let i = 1; i <= portsAmount; i++) {
		// some code
		ports.push({
			type: 'symbolPort',
			symbolId: i,
			position: new go.Point(step * i, height / 2),
			portId: `rct${i}`,
			portBearing: PortBearing.S,
		});
	}

	return {
		key,
		height,
		width: step * portsAmount + step,
		category: 'rctNode',
		ports,
		text,
		background,
	};
}
