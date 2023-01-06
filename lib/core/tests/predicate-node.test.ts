import { DataFactory } from 'n3';
import { newGraphState, toAddPatch } from './test-utils';
import { GraphEdge, GraphEdgeProperty, PROPS as P } from '../types/core';
import { patchGraphState } from 'core/patch';

const { quad: q, literal: l, namedNode: n } = DataFactory;

describe('Predicate nodes', () => {
	it('Property before edge', () => {
		//Arrange
		const state = newGraphState();
		const oldPatches = toAddPatch([
			q(n('Edge'), n(P.stroke.iri), l('green')),
			q(n('Edge'), n('SomeDataProp'), l('someValue')),
			q(n('Edge'), n('SomeEdgyEdge'), n('SomeNode')),
		]);
		const oldResult = patchGraphState(state, oldPatches);
		const change = toAddPatch([q(n('A'), n('Edge'), n('B'))]);

		// Act
		const newResult = patchGraphState(oldResult.graphState, change);

		// Assert
		const addEdgePatch = newResult.graphPatches.find(
			(p) => p.action === 'add' && p.element.type === 'edge'
		);
		const addEdgePropPatch = newResult.graphPatches.find(
			(p) => p.action === 'add' && p.element.type === 'edgeProperty'
		);
		expect(addEdgePatch).toBeTruthy();
		expect(addEdgePropPatch).toBeTruthy();
		const edgeElement = addEdgePatch?.element as GraphEdge;
		const edgeProperty = addEdgePropPatch?.element as GraphEdgeProperty;
		expect(edgeProperty.target).toBe(edgeElement.id);
		expect(edgeProperty.key).toBe('stroke');
		expect(edgeProperty.value).toBe('green');
	});

	it('Edge before property', () => {
		//Arrange
		const state = newGraphState();
		const oldPatches = toAddPatch([q(n('A'), n('Edge'), n('B'))]);
		const change = toAddPatch([q(n('Edge'), n(P.stroke.iri), l('green'))]);
		const oldResult = patchGraphState(state, oldPatches);

		// Act
		const newResult = patchGraphState(oldResult.graphState, change);

		// Assert
		const addEdgePropPatch = newResult.graphPatches.find(
			(p) => p.action === 'add' && p.element.type === 'edgeProperty'
		);
		expect(addEdgePropPatch).toBeTruthy();
		const edgeProperty = addEdgePropPatch?.element as GraphEdgeProperty;
		expect(edgeProperty.key).toBe('stroke');
		expect(edgeProperty.value).toBe('green');
	});
});
