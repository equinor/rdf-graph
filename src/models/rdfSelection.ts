import { RdfIndividual } from './rdfIndividual';
import { RdfTriple } from './rdfTriple';

export class RdfSelection {
	constructor(readonly individuals: RdfIndividual[], readonly rdfTriple: RdfTriple[]) {}
}
