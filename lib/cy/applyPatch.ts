import Cytoscape, { ElementDefinition } from 'cytoscape';
import { GraphEdge, GraphNodePatch, GraphPatch, GraphPropertyPatch } from 'core/types/core';

export function applyPatch(patches: GraphPatch[], cy: Cytoscape.Core) {
	for (const patch of patches) {
		switch (patch.content.type) {
			case 'node':
				switch (patch.content.variant) {
					case 'default':
					case 'symbol':
					case 'connector':
						if (patch.action === 'add') {
							addNode(cy, patch.content);
						}
						break;
					default:
						break;
				}
				break;
			case 'edge':
				break;
			case 'property':
				break;
			default:
				break;
		}
	}
}

function addNode(cy: Cytoscape.Core, node: GraphNodePatch) {
	const el: ElementDefinition = { data: { id: node.id, label: node.id } };
	if (node.variant === 'connector') {
		el.data.parent = node.id;
	}
	cy.add(el);
	console.log('add', node);
}
