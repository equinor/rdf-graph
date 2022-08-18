import { GraphPatch, GraphState, SelectionCallback } from '../types/graphModel';

export type GraphStateProps = {
	graphState: GraphState;
	graphPatch: GraphPatch;
};

export type GraphProps = {
	graphState: GraphState;
	graphPatch: GraphPatch;
	selectionEffect: SelectionCallback;
};
