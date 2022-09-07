import { RdfPatch2 } from '../types';
import { Store, Quad } from 'n3';
import { SelectionCallback } from '../types/graphModel';
import { UiNodeSymbol } from '../ui/applyPatch';

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
	selectionEffect?: SelectionCallback;
	symbolProvider?: (id: string, rotation?: number) => UiNodeSymbol | undefined;
};
