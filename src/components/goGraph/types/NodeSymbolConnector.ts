import { Point } from './Point';

export enum PortBearing {
	N,
	E,
	S,
	W,
}

export class NodeSymbolConnector {
	constructor(readonly id: string, readonly point: Point, readonly portBearing: PortBearing) {}
}
