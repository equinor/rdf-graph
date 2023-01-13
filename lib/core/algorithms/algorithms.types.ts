import { GraphPatch } from 'core/types/core';

export type AlgorithmResult = {
	patches: GraphPatch[];
	undoPatches: GraphPatch[];
};
