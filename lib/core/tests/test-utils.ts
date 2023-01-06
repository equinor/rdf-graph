import { GraphState, RdfPatch } from 'core/types/core';
import { DataFactory, Quad } from 'n3';
const { quad: q, literal: l, namedNode: n } = DataFactory;

export function newGraphState(): GraphState {
	return {
		nodeStore: {},
		predicateNodeStore: {},
		edgeStore: {},
	};
}

export function toAddPatch(quads: Quad[]): RdfPatch[] {
	return quads.map((q) => {
		return { action: 'add', data: q };
	});
}

export function toRemovePatch(quads: Quad[]): RdfPatch[] {
	return quads.map((q) => {
		return { action: 'remove', data: q };
	});
}
