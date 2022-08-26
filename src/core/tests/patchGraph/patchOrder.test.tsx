import { DataFactory } from 'n3';
import * as P from '../../mapper/predicates';
import { createState, SimplifiedAssertion, testPatchOrder, toAddPatch, toRmPatch } from './testUtils';

const { quad: q, literal: l, namedNode: n } = DataFactory;

test('Node becomes connector and node again', () => {
	const originalData = [
		q(n('N1'), P.labelPredicate, l('Node 1')),
		q(n('N1'), P.hasSvgPredicate, l('Separator_1')),
		q(n('N2'), P.labelPredicate, l('Node 2')),
		q(n('N2'), P.hasConnectorSuffixPredicate, l('c1')),
		q(n('N3'), P.labelPredicate, l('Node 3')),
		q(n('N2'), n('isConnectedTo'), n('N3')),
	];

	const quads = [q(n('N1'), P.hasConnectorPredicate, n('N2'))];
	const addChange = toAddPatch(quads);
	const rmChange = toRmPatch(quads);

	const expectedOrder: SimplifiedAssertion[] = [
		{ type: 'property', action: 'remove' }, // Label
		{ type: 'property', action: 'remove' }, // Connector id
		{ type: 'edge', action: 'remove' }, // Edge to N3
		{ type: 'node', action: 'remove' }, // N2
		{ type: 'connector', action: 'add' }, // N2 as connector
		{ type: 'property', action: 'add' }, // Label
		{ type: 'property', action: 'add' }, // Connector id
		{ type: 'property', action: 'add' }, // Relative pos
		{ type: 'edge', action: 'add' }, // Edge to N3
	];

	const expectedRmOrder: SimplifiedAssertion[] = [
		{ type: 'property', action: 'remove' }, // Lable
		{ type: 'property', action: 'remove' }, // Connector id
		{ type: 'property', action: 'remove' }, // Relative pos from svg api
		{ type: 'edge', action: 'remove' }, // Edge to N3
		{ type: 'connector', action: 'remove' }, // N2 as Connector
		{ type: 'node', action: 'add' }, // N2 as Node
		{ type: 'property', action: 'add' }, // Label
		{ type: 'property', action: 'add' }, // Connector id
		{ type: 'edge', action: 'add' }, // Edge to N3
	];

	const addedState = testPatchOrder(createState(originalData), addChange, expectedOrder);
	testPatchOrder(addedState.graphState, rmChange, expectedRmOrder);
});

test('Edges becomes colored', () => {
	const originalData = [
		q(n('N1'), P.labelPredicate, l('Node 1')),
		q(n('N2'), P.labelPredicate, l('Node 2')),
		q(n('N3'), P.labelPredicate, l('Node 3')),
		q(n('N1'), n('isConnectedTo'), n('N2')),
		q(n('N2'), n('isConnectedTo'), n('N3')),
	];

	const change = toAddPatch([q(n('isConnectedTo'), P.colorPredicate, l('green'))]);

	const expectedOrder: SimplifiedAssertion[] = [
		{ type: 'property', action: 'add' },
		{ type: 'property', action: 'add' },
	];

	testPatchOrder(createState(originalData), change, expectedOrder);
});

test('Edge from predicate with color', () => {
	const originalData = [
		q(n('N1'), P.labelPredicate, l('Node 1')),
		q(n('N2'), P.labelPredicate, l('Node 2')),
		q(n('N3'), P.labelPredicate, l('Node 3')),

		q(n('isConnectedTo'), P.colorPredicate, l('green')),
	];

	const change = toAddPatch([q(n('N1'), n('isConnectedTo'), n('N2')), q(n('N2'), n('isConnectedTo'), n('N3'))]);

	const expectedOrder: SimplifiedAssertion[] = [
		{ type: 'property', action: 'remove' },
		{ type: 'node', action: 'remove' },
		{ type: 'edge', action: 'add' },
		{ type: 'property', action: 'add' },
		{ type: 'edge', action: 'add' },
		{ type: 'property', action: 'add' },
	];

	testPatchOrder(createState(originalData), change, expectedOrder);
});

test('Edge remove color', () => {
	const originalData = [
		q(n('N1'), P.labelPredicate, l('Node 1')),
		q(n('N2'), P.labelPredicate, l('Node 2')),
		q(n('N1'), n('isConnectedTo'), n('N2')),
		q(n('isConnectedTo'), P.colorPredicate, l('green')),
	];

	const change = toRmPatch([q(n('isConnectedTo'), P.colorPredicate, l('green'))]);

	const expectedOrder: SimplifiedAssertion[] = [{ type: 'property', action: 'remove' }];

	testPatchOrder(createState(originalData), change, expectedOrder);
});

test('Remove edge with color', () => {
	const originalData = [
		q(n('N1'), P.labelPredicate, l('Node 1')),
		q(n('N2'), P.labelPredicate, l('Node 2')),
		q(n('N1'), n('isConnectedTo'), n('N2')),
		q(n('isConnectedTo'), P.colorPredicate, l('green')),
	];

	const change = toRmPatch([q(n('N1'), n('isConnectedTo'), n('N2'))]);

	const expectedOrder: SimplifiedAssertion[] = [
		{ type: 'property', action: 'remove' },
		{ type: 'edge', action: 'remove' },
		{ type: 'node', action: 'add' },
		{ type: 'property', action: 'add' },
	];

	testPatchOrder(createState(originalData), change, expectedOrder);
});
