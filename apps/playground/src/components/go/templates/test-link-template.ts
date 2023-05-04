import * as go from 'gojs';

export function createTestLinkTemplate(): go.Link {
	return new go.Link().add(new go.Shape({ stroke: 'cyan', strokeWidth: 20 }));
}
