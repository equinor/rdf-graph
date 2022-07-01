import { Point } from './Point';

export enum PortDirection {
	N,
	E,
	S,
	W,
}

export class NodeSymbolConnector {
	constructor(readonly id: string, readonly point: Point, readonly portDirection: PortDirection) {}
}
