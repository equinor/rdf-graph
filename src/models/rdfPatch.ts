import { RdfIndividual } from './rdfIndividual';
import { RdfTriple } from './rdfTriple';

export class RdfPatch {
	tripleAdditions: RdfTriple[];
	tripleRemovals: RdfTriple[];
	individualAdditions: RdfIndividual[];
	individualRemovals: RdfIndividual[];
	constructor({
		tripleAdditions = [],
		tripleRemovals = [],
		individualAdditions = [],
		individualRemovals = [],
	}: {
		tripleAdditions?: RdfTriple[];
		tripleRemovals?: RdfTriple[];
		individualAdditions?: RdfIndividual[];
		individualRemovals?: RdfIndividual[];
	}) {
		this.tripleAdditions = tripleAdditions;
		this.tripleRemovals = tripleRemovals;
		this.individualAdditions = individualAdditions;
		this.individualRemovals = individualRemovals;
	}
}
