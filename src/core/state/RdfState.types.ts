import { GraphAssertion, RdfPatch2 } from '../types';
import { Store, Quad } from 'n3';
import { SelectionCallback } from '../types/graphModel';
import { UiNodeSymbol } from '../ui/applyPatch';

export type RdfAction =
	| { type: 'add'; data: Iterable<Quad> }
	| { type: 'remove'; data: Iterable<Quad> }
	| { type: 'patch'; data: RdfPatch2 }
	| { type: 'replace'; data: Iterable<Quad> }
	| { type: 'clear' }
	| { type: 'reset' };

export type RdfState = {
	rdfStore: Store<Quad, Quad, Quad, Quad>;
	rdfPatch: RdfPatch2;
};

export type RdfGraphErrorBase = {
	message: string;
	/** 'error' from a try/catch block */
	origin?: unknown;
};

export type GenericError = RdfGraphErrorBase & {
	type: 'GENERIC';
};

export type GraphAssertionError = RdfGraphErrorBase & {
	type: 'ASSERTION';
	assertion?: GraphAssertion;
};

export type RdfGraphError = GenericError | GraphAssertionError;

//assertion: GraphAssertion;
export type RdfStateProps = RdfState & {
	selectionEffect?: SelectionCallback;
	symbolProvider?: (id: string, rotation?: number) => UiNodeSymbol | undefined;
	onErrorCallback?: (error: RdfGraphError) => void;
};
