import { Quad } from 'n3';

export class RdfPatch {
	tripleAdditions: Quad[];
	tripleRemovals: Quad[];
	constructor({ tripleAdditions = [], tripleRemovals = [] }: { tripleAdditions: Quad[]; tripleRemovals: Quad[] }) {
		this.tripleAdditions = tripleAdditions;
		this.tripleRemovals = tripleRemovals;
	}
}

export const emptyPatch: RdfPatch = { tripleAdditions: [], tripleRemovals: [] };
