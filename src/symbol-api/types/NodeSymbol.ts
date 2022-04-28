//import { stringToSvgElement } from '../svg-manipulation';
import { NodeSymbolConnector } from './NodeSymbolConnector';

export interface NodeSymbolTemplate {
	readonly id: string;
	readonly svg: string;
	readonly width: number;
	readonly height: number;
	readonly connectors: NodeSymbolConnector[];
}

export class NodeSymbol implements NodeSymbolTemplate {
	constructor(
		readonly id: string,
		readonly svg: string,
		readonly width: number,
		readonly height: number,
		readonly connectors: NodeSymbolConnector[]
	) {}
}
