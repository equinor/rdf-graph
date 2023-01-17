import { GraphPatch } from './core';

type RdfGraphErrorBase = {
	message: string;
	/** 'error' from a try/catch block */
	origin?: unknown;
};

export type GenericError = RdfGraphErrorBase & {
	type: 'GENERIC';
};

export type GraphPatchError = RdfGraphErrorBase & {
	type: 'PATCH';
	patch?: GraphPatch;
};

export type RdfGraphError = GenericError | GraphPatchError;
