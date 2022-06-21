import { RdfPatch2 } from '../../models';
import { Store, Quad } from 'n3';

export type RdfAction =
	| { type: 'add'; data: Iterable<Quad> }
	| { type: 'remove'; data: Iterable<Quad> }
	| { type: 'patch'; data: RdfPatch2 }
	| { type: 'replace'; data: Iterable<Quad> }
	| { type: 'clear' };

export type RdfStateProps = {
	rdfStore: Store<Quad, Quad, Quad, Quad>;
	rdfPatch: RdfPatch2;
};
