import { Edge } from './edge';

export class Node {
	constructor(readonly iri: string, readonly data: any = {}, readonly incoming: Edge[] = [], readonly outgoing: Edge[] = []) {}
}
