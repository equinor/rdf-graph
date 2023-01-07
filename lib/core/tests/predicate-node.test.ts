import { DataFactory } from 'n3';
import { newGraphState, toAddPatch } from './test-utils';
import { GraphEdge, GraphPropertyPatch } from '../types/core';
import { patchGraphState } from 'core/patch';
import { directPropConfig } from 'core/propConfig';

const { quad: q, literal: l, namedNode: n } = DataFactory;

describe('Predicate nodes', () => {
	it('Property before edge', () => {
		//Arrange
		const state = newGraphState();
		const oldPatches = toAddPatch([
			q(n('Edge'), n(directPropConfig.stroke.iri), l('green')),
			q(n('Edge'), n('SomeDataProp'), l('someValue')),
			q(n('Edge'), n('SomeEdgyEdge'), n('SomeNode')),
		]);
		const oldResult = patchGraphState(state, oldPatches);
		const change = toAddPatch([q(n('A'), n('Edge'), n('B'))]);

		// Act
		const newResult = patchGraphState(oldResult.graphState, change);

		// Assert

		const addEdgePatch = newResult.graphPatches.find(
			(p) => p.action === 'add' && p.content.type === 'edge'
		);
		const addEdgePropPatch = newResult.graphPatches.find(
			(p) => p.action === 'add' && p.content.type === 'property'
		);
		expect(addEdgePatch).toBeTruthy();
		expect(addEdgePropPatch).toBeTruthy();
		const edgeElement = addEdgePatch?.content as GraphEdge;
		const edgeProperty = addEdgePropPatch?.content as GraphPropertyPatch;

		expect(edgeProperty.id).toBe(edgeElement.id);
		expect(edgeProperty.prop.key).toBe('stroke');
		expect(edgeProperty.prop.value).toBe('green');
	});

	it('Edge before property', () => {
		//Arrange
		const state = newGraphState();
		const oldPatches = toAddPatch([q(n('A'), n('Edge'), n('B'))]);
		const change = toAddPatch([q(n('Edge'), n(directPropConfig.stroke.iri), l('green'))]);
		const oldResult = patchGraphState(state, oldPatches);

		// Act
		const newResult = patchGraphState(oldResult.graphState, change);

		// Assert
		const addEdgePropPatch = newResult.graphPatches.find(
			(p) => p.action === 'add' && p.content.type === 'property'
		);
		expect(addEdgePropPatch).toBeTruthy();
		const edgeProperty = addEdgePropPatch?.content as GraphPropertyPatch;
		expect(edgeProperty.prop.key).toBe('stroke');
		expect(edgeProperty.prop.value).toBe('green');
	});
});
