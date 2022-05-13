import { RdfTriple } from './rdfTriple';

export class RdfIndividual {
	constructor(readonly iri: string, readonly data: any = {}, readonly incoming: RdfTriple[] = [], readonly outgoing: RdfTriple[] = []) {}
}
