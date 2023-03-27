import { GraphState, RdfPatch, UiSymbol, UiSymbolConnector, UiSymbolProvider } from '../src/types';
import { DataFactory, Quad } from 'n3';
import { patchGraphState } from '../src/patch';

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

export const testSymbol: UiSymbol = {
	id: 'LZ009A',
	svg: '\u003Csvg width=\u002248\u0022 height=\u002248\u0022 viewBox=\u00220 0 48 48\u0022 xmlns=\u0022http://www.w3.org/2000/svg\u0022 fill=\u0022#231f20\u0022\u003E\n  \u003Cg id=\u0022LZ009A\u0022\u003E\n    \u003Cpath id=\u0022Symbol\u0022 d=\u0022M4 44V4H44V44H4ZM42.281 5H5V42.281L42.281 5ZM5.69522 43H43V5.69522L5.69522 43Z\u0022 /\u003E\n  \u003C/g\u003E\n\u003C/svg\u003E',
	geometry: 'M4 44V4H44V44H4ZM42.281 5H5V42.281L42.281 5ZM5.69522 43H43V5.69522L5.69522 43Z',
	width: 48,
	height: 48,
	connectors: [
		{
			id: '1',
			position: { x: 43.5, y: 24 },
			direction: 90,
		},
		{
			id: '2',
			position: { x: 24, y: 43.5 },
			direction: 180,
		},
		{
			id: '3',
			position: { x: 4.5, y: 24 },
			direction: 270,
		},
		{ id: '4', position: { x: 24, y: 4.5 }, direction: 0 },
	] as UiSymbolConnector[],
};

export const testSymbolProvider: UiSymbolProvider = (_id, _rot) => testSymbol;

export const createChangePatches = (original: Quad[], change: RdfPatch[]) => {
	const state = newGraphState();
	const oldPatches = toAddPatch(original);
	const oldResult = patchGraphState(state, oldPatches);

	return patchGraphState(oldResult.graphState, change).graphPatches;
};

const { quad: q, literal: l, namedNode: n } = DataFactory;

export const testNode1 = 'A';
export const testNode2 = 'B';
export const simpleProp = q(n(testNode1), n('SomeDataProp'), l('someValue'));
export const simpleEdge = q(n('A'), n('SomeDataProp'), n(testNode2));
