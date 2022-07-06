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

export function createRectangleNode(key: number, text: string, connecters: any[], background = '#FF5733') {
	const ports = [];

	const step = 100;
	const height = 200;

	const topConnectors = connecters.filter(({ direction }) => direction === 'top');
	const bootomConnectors = connecters.filter(({ direction }) => direction === 'bottom');

	const topAmount = topConnectors.length;
	const bottomAmount = bootomConnectors.length;

	// Finding max width between connectors
	const fmwbc = topAmount > bottomAmount ? topAmount : bottomAmount;

	// TOP
	for (let i = 0; i < topAmount; i++) {
		const { id } = topConnectors[i];
		const y = (height / 2) * -1;
		const x = step + step * i;

		ports.push({
			type: 'symbolPort',
			symbolId: `top-${i}`,
			position: new go.Point(x, y),
			portId: id,
			portBearing: PortBearing.N,
		});
	}

	// BOTTOM
	for (let i = 0; i < bottomAmount; i++) {
		const { id } = bootomConnectors[i];
		const y = height / 2;
		const x = step + step * i;

		ports.push({
			type: 'symbolPort',
			symbolId: `bottom-${i}`,
			position: new go.Point(x, y),
			portId: id,
			portBearing: PortBearing.S,
		});
	}

	return {
		key,
		height,
		width: step * fmwbc + step,
		category: 'rctNode',
		ports,
		text,
		background,
	};
}
