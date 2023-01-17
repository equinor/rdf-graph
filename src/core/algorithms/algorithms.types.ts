import { GraphPatch } from '../types';

export type AlgorithmResult = {
	patches: GraphPatch[];
	undoPatches: GraphPatch[];
};
