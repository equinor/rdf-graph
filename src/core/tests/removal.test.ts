import {
	createChangePatches,
	simpleEdge,
	simpleProp,
	testNode1,
	testNode2,
	toRemovePatch,
} from './test-utils';

describe('Remove node when references are gone', () => {
	it('Remove node when removing literal', () => {
		const patches = createChangePatches([simpleProp], toRemovePatch([simpleProp]));

		expect(patches.length).toBe(2);
		expect(
			patches.find(
				(p) => p.action === 'remove' && p.content.type === 'node' && p.content.id === testNode1
			)
		).toBeTruthy();
	});

	it('Remove node when edges are gone', () => {
		const patches = createChangePatches([simpleEdge], toRemovePatch([simpleEdge]));

		expect(patches.length).toBe(3);

		expect(
			patches.find(
				(p) => p.action === 'remove' && p.content.type === 'node' && p.content.id === testNode1
			)
		).toBeTruthy();
		expect(
			patches.find(
				(p) => p.action === 'remove' && p.content.type === 'node' && p.content.id === testNode2
			)
		).toBeTruthy();
	});
});
