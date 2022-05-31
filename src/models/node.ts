import { Quad } from 'n3';

export class Node {
	constructor(readonly iri: string, readonly data: any = {}, readonly incoming: Quad[] = [], readonly outgoing: Quad[] = []) {}
}
