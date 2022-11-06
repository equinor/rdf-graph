import { GraphPatch, GraphState, SelectionCallback } from '../types/graphModel';
import { RdfGraphError } from './RdfState.types';

export type GraphStateProps = {
	graphState: GraphState;
	graphPatch: GraphPatch;
};

export type GraphProps = {
	graphState: GraphState;
	graphPatch: GraphPatch;
	selectionEffect: SelectionCallback;
	onErrorCallback?: (error: RdfGraphError) => void;
};
