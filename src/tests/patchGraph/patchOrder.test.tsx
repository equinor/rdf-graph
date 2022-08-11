import { DataFactory, Quad } from 'n3';
import * as P from '../../mapper/predicates';
import { patchGraph } from '../../state/patchGraph';
import { emptyGraph, toPatch } from './testUtils';

const { quad: q, literal: l, namedNode: n } = DataFactory;

type SimplifiedAssertion = { type: 'metadata' | 'property' | 'node' | 'edge' | 'connector' | 'NA'; action: 'add' | 'remove' | 'NA' };

test('Node becomes connector', () => {
	const originalData = [
		q(n('N1'), P.labelPredicate, l('Node 1')),
		q(n('N1'), P.hasSvgPredicate, l('Separator_1')),
		q(n('N2'), P.labelPredicate, l('Node 2')),
		q(n('C'), P.hasConnectorSuffixPredicate, l('c1')),
		q(n('N3'), P.labelPredicate, l('Node 3')),
		q(n('N2'), n('isConnectedTo'), n('N3')),
	];

	const change = [q(n('N1'), P.hasConnectorPredicate, n('N2'))];

	const expectedOrder: SimplifiedAssertion[] = [
		{ type: 'metadata', action: 'add' },
		{ type: 'property', action: 'remove' },
		{ type: 'edge', action: 'remove' },
		{ type: 'metadata', action: 'remove' },
		{ type: 'node', action: 'remove' },
		{ type: 'connector', action: 'add' },
		{ type: 'property', action: 'add' },
		{ type: 'metadata', action: 'add' },
		{ type: 'edge', action: 'add' },
		{ type: 'property', action: 'add' },
	];

	testPatchOrder(originalData, change, expectedOrder);
});

const testPatchOrder = (originalData: Quad[], change: Quad[], expectedOrder: SimplifiedAssertion[]) => {
	const originalRes = patchGraph(emptyGraph(), toPatch(originalData));
	for (const _patch of originalRes.graphPatch) {
	}

	const changeRes = patchGraph(originalRes.graphState, toPatch(change));
	let actualAssertions: SimplifiedAssertion[] = [];

	for (const assertion of changeRes.graphPatch) {
		actualAssertions.push({ type: assertion.assertion.type, action: assertion.action });
	}

	if (actualAssertions.length !== expectedOrder.length) {
		printDebugArray(expectedOrder, actualAssertions);
		throw new Error('Length of actual and expected assertions differs');
	}

	for (let i = 0; i < expectedOrder.length; i++) {
		if (expectedOrder[i].action !== actualAssertions[i].action || expectedOrder[i].type !== actualAssertions[i].type) {
			printDebugArray(expectedOrder, actualAssertions);
			console.log(expectedOrder[i], actualAssertions[i]);
			throw new Error('Actual and expected assertions differs at element ' + i);
		}
	}
};

const printDebugArray = (expected: SimplifiedAssertion[], actual: SimplifiedAssertion[]) => {
	const filledExpected = addFillElements(expected, actual.length - expected.length);
	const filledActual = addFillElements(actual, expected.length - actual.length);

	const debugArray = [];
	for (let i = 0; i < filledExpected.length; i++) {
		debugArray.push({ expected: filledExpected[i], actual: filledActual[i] });
	}
	console.table(debugArray);
};

const addFillElements = (array: SimplifiedAssertion[], n: number) => {
	const newArray = [...array];
	for (let i = 0; i < n; i++) {
		newArray.push({ type: 'NA', action: 'NA' });
	}
	return newArray;
};
