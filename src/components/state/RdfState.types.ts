import { RdfPatch2 } from '../../models';
import { Store, Quad } from 'n3';
import { GraphSelection } from '../../models/graphModel';

export type RdfAction =
	| { type: 'add'; data: Iterable<Quad> }
	| { type: 'remove'; data: Iterable<Quad> }
	| { type: 'patch'; data: RdfPatch2 }
	| { type: 'replace'; data: Iterable<Quad> }
	| { type: 'clear' };

export type RdfState = {
	rdfStore: Store<Quad, Quad, Quad, Quad>;
	rdfPatch: RdfPatch2;
};

export type RdfStateProps = RdfState & {
	onElementSelected?: (selection: GraphSelection) => void;
};
