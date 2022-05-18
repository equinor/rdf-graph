import { Quad } from 'n3';
import { Edge } from './edge';
import { Node } from './node';

export class RdfPatch {
	tripleAdditions: Quad[];
	edgeRemovals: Edge[];
	individualAdditions: Node[];
	individualRemovals: Node[];
	constructor({
		tripleAdditions = [],
		edgeRemovals = [],
		individualAdditions = [],
		individualRemovals = [],
	}: {
		tripleAdditions?: Quad[];
		edgeRemovals?: Edge[];
		individualAdditions?: Node[];
		individualRemovals?: Node[];
	}) {
		this.tripleAdditions = tripleAdditions;
		this.edgeRemovals = edgeRemovals;
		this.individualAdditions = individualAdditions;
		this.individualRemovals = individualRemovals;
	}
}
