import { AlgorithmResult } from './algorithms.types';

export const emptyResult: AlgorithmResult = {
	patches: [],
	undoPatches: [],
};

export const mergeResult = (r1: AlgorithmResult, r2: AlgorithmResult) => {
	const result: AlgorithmResult = {
		patches: [...r1.patches, ...r2.patches],
		undoPatches: [...r1.undoPatches, ...r2.undoPatches],
	};
	return result;
};
