import { Quad } from 'n3';

export class RdfPatch {
	tripleAdditions: Quad[];
	tripleRemovals: Quad[];
	constructor({
		tripleAdditions = [],
		tripleRemovals = [],
	}: {
		tripleAdditions: Quad[];
		tripleRemovals: Quad[];
	}) {
		this.tripleAdditions = tripleAdditions;
		this.tripleRemovals = tripleRemovals;
	}
}

export type RdfAssertion = {
	action: 'add' | 'remove';
	assertion: Quad;
};
export type RdfPatch2 = RdfAssertion[] | Iterable<RdfAssertion>;

export const emptyPatch: RdfPatch = { tripleAdditions: [], tripleRemovals: [] };
