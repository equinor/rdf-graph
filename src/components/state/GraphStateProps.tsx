import { GraphPatch, GraphSelection, GraphState } from '../../models/graphModel';

export type GraphStateProps = {
	graphState: GraphState;
	graphPatch: GraphPatch;
	onElementsSelected: (selection: GraphSelection) => void;
};
