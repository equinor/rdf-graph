import { DataFactory, Quad } from 'n3';
import { GraphEdge, GraphNode, GraphState } from '../../types';
import { RdfPatch2 } from '../../types/rdfPatch';

import * as P from '../../mapper/predicates';
import { patchGraph } from '../../state/patchGraph';
import { defaultSymbolProvider } from '../../ui/defaultSymbolProvider';
const { quad: q, literal: l, namedNode: n } = DataFactory;

export type SimplifiedAssertion = { type: 'metadata' | 'property' | 'node' | 'edge' | 'connector' | 'NA'; action: 'add' | 'remove' | 'NA' };

export type DebugElement = {
	expected: SimplifiedAssertion;
	actual: SimplifiedAssertion;
};

export const testSymbolId = 'PT003A';
export const testSymbolConnectorSuffix_1 = '1';

export const svgWithConnectorQuads = (connectorId: string) => [
	q(n('S'), P.hasSvgPredicate, l(testSymbolId)),
	q(n('S'), P.hasConnectorPredicate, n('C')),
	q(n('C'), P.hasConnectorSuffixPredicate, l(connectorId)),
];

export const emptyGraph = (): GraphState => {
	return { linkIndex: new Map<string, GraphEdge>(), nodeIndex: new Map<string, GraphNode>() };
};

export const createState = (quads: Quad[]): GraphState => {
	const originalRes = patchGraph(emptyGraph(), toAddPatch(quads), { symbolProvider: defaultSymbolProvider });
	for (const _patch of originalRes.graphPatch) {
	}
	return originalRes.graphState;
};

export const toAddPatch = (quads: Quad[]): RdfPatch2 =>
	quads.map((quad) => {
		return { action: 'add', assertion: quad };
	});

export const toRmPatch = (quads: Quad[]): RdfPatch2 =>
	quads.map((quad) => {
		return { action: 'remove', assertion: quad };
	});

export const testPatchOrder = (originalData: GraphState, change: RdfPatch2, expectedOrder: SimplifiedAssertion[]) => {
	const changeRes = patchGraph(originalData, change, { symbolProvider: defaultSymbolProvider });
	let actualAssertions: SimplifiedAssertion[] = [];

	for (const assertion of changeRes.graphPatch) {
		actualAssertions.push({ type: assertion.assertion.type, action: assertion.action });
		/* // Useful for debugging properties not included in SimplifiedAssertion
		console.log("Got patch", {assertion});
		if (assertion.assertion.type === 'property') {
			console.log("Property value is ", assertion.assertion.value)
		}
		*/
	}

	if (actualAssertions.length !== expectedOrder.length) {
		printDebugArray(expectedOrder, actualAssertions);
		throw new Error('Length of actual and expected assertions differs');
	}

	for (let i = 0; i < expectedOrder.length; i++) {
		if (expectedOrder[i].action !== actualAssertions[i].action || expectedOrder[i].type !== actualAssertions[i].type) {
			printDebugArray(expectedOrder, actualAssertions);
			throw new Error('Actual and expected assertions differs at element ' + i);
		}
	}
	return changeRes;
};

export const printDebugArray = (expected: SimplifiedAssertion[], actual: SimplifiedAssertion[]) => {
	const filledExpected = addFillElements(expected, actual.length - expected.length);
	const filledActual = addFillElements(actual, expected.length - actual.length);

	const debugArray: DebugElement[] = [];
	for (let i = 0; i < filledExpected.length; i++) {
		debugArray.push({ expected: filledExpected[i], actual: filledActual[i] });
	}
	console.table(debugArray);
};

export const addFillElements = (array: SimplifiedAssertion[], n: number) => {
	const newArray = [...array];
	for (let i = 0; i < n; i++) {
		newArray.push({ type: 'NA', action: 'NA' });
	}
	return newArray;
};
