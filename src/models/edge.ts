import { Quad } from 'n3';

export class Edge {
	constructor(readonly edgeId: string, readonly quad: Quad) {}
}
