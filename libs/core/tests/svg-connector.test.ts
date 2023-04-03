import { DataFactory } from 'n3';
import { newGraphState, testSymbolProvider, toAddPatch } from './test-utils';
import { PatchGraphOptions, patchGraphState } from '../src/patch';
import { directPropConfig } from '../src/propConfig';

const { quad: q, literal: l, namedNode: n } = DataFactory;

const patchOptions: PatchGraphOptions = {
	symbolProvider: testSymbolProvider,
};

describe('Svg and connectors', () => {
	it('Check conversion after hasConnector', () => {
		//Arrange
		const connectorIri = 'Connector1';
		const state = newGraphState();
		const oldPatches = toAddPatch([
			q(n('A'), n(directPropConfig.symbolId.iri), l('LZ009A')),
			q(n('Connector1'), n(directPropConfig.connectorName.iri), l('1')),
			q(n('Connector1'), n('someEdge'), n('someNode')),
		]);
		const change = toAddPatch([q(n('A'), n(directPropConfig.connectorIds.iri), n(connectorIri))]);

		const oldResult = patchGraphState(state, oldPatches, patchOptions);
		// Act
		const newResult = patchGraphState(oldResult.graphState, change, patchOptions);

		// Assert
		const direction = newResult.graphPatches.find((p) => {
			if (p.content.type === 'property') {
				if (p.content.id === connectorIri && p.content.prop.type === 'derived') {
					const prop = p.content.prop;
					return prop.key === 'connectorDirection' && prop.value === 90;
				}
			}
			return false;
		});

		const pos = newResult.graphPatches.find((p) => {
			if (p.content.type === 'property') {
				if (p.content.id === connectorIri && p.content.prop.type === 'derived') {
					const prop = p.content.prop;
					return (
						prop.key === 'connectorRelativePosition' && prop.value.x === 43.5 && prop.value.y === 24
					);
				}
			}
			return false;
		});
		expect(direction).toBeTruthy();
		expect(pos).toBeTruthy();
	});
});
