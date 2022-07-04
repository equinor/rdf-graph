import { GraphPatch, GraphSelection, GraphState, SelectionCallback } from '../../models/graphModel';

export type GraphStateProps = {
	graphState: GraphState;
	graphPatch: GraphPatch;
};

export type GraphProps = {
	graphState: GraphState;
	graphPatch: GraphPatch;
	onElementsSelected: SelectionCallback;
};
