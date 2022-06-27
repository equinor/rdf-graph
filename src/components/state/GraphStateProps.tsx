import { GraphPatch, GraphState, SelectionCallback } from '../../models/graphModel';

export type GraphStateProps = {
	graphState: GraphState;
	graphPatch: GraphPatch;
	onElementsSelected: (selection: GraphSelection) => void;
};

export type GraphProps = {
	graphState: GraphState;
	graphPatch: GraphPatch;
	onElementsSelected: SelectionCallback;
};
