import { DataFactory } from 'n3';
import { createChangePatches, toAddPatch, toRemovePatch } from './test-utils';
import { GraphEdge, GraphPropertyPatch } from '../src/types/core';
import { directPropConfig } from '../src/propConfig';

const { quad: q, literal: l, namedNode: n } = DataFactory;

describe('Predicate nodes', () => {
	it('Property before edge', () => {
		//Arrange
		const existingData = [
			q(n('Edge'), n(directPropConfig.stroke.iri), l('green')),
			q(n('Edge'), n('SomeDataProp'), l('someValue')),
			q(n('Edge'), n('SomeEdgyEdge'), n('SomeNode')),
		];
		const change = toAddPatch([q(n('A'), n('Edge'), n('B'))]);

		// Act
		const patches = createChangePatches(existingData, change);

		// Assert

		const addEdgePatch = patches.find((p) => p.action === 'add' && p.content.type === 'edge');
		const addEdgePropPatch = patches.find(
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
		const existingData = [q(n('A'), n('Edge'), n('B'))];
		const change = toAddPatch([q(n('Edge'), n(directPropConfig.stroke.iri), l('green'))]);

		// Act
		const patches = createChangePatches(existingData, change);

		// Assert
		const addEdgePropPatch = patches.find(
			(p) => p.action === 'add' && p.content.type === 'property'
		);
		expect(addEdgePropPatch).toBeTruthy();
		const edgeProperty = addEdgePropPatch?.content as GraphPropertyPatch;
		expect(edgeProperty.prop.key).toBe('stroke');
		expect(edgeProperty.prop.value).toBe('green');
	});

	it('Remove property', () => {
		//Arrange
		const existingData = [
			q(n('A'), n('Edge'), n('B')),
			q(n('Edge'), n(directPropConfig.stroke.iri), l('green')),
		];
		const change = toRemovePatch([q(n('Edge'), n(directPropConfig.stroke.iri), l('green'))]);

		// Act
		const patches = createChangePatches(existingData, change);

		// Assert
		const addEdgePropPatch = patches.find(
			(p) => p.action === 'remove' && p.content.type === 'property'
		);
		expect(addEdgePropPatch).toBeTruthy();
		const edgeProperty = addEdgePropPatch?.content as GraphPropertyPatch;
		expect(edgeProperty.prop.key).toBe('stroke');
		expect(edgeProperty.prop.value).toBe('green');
	});
});
