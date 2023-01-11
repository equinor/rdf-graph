import Cytoscape, { ElementDefinition } from 'cytoscape';
import { GraphEdgePatch, GraphNodePatch, GraphPatch, GraphPropertyPatch } from 'core/types/core';
import { json } from 'stream/consumers';

const nodeTypeKey = 'nodeType';
const layoutIgnoreKey = 'layoutIgnore';

enum NodeType {
	SymbolContainer = 'SymbolContainer',
	SymbolImage = 'SymbolImage',
	SymbolConnector = 'SymbolConnector',
	SymbolOrigin = 'SymbolOrigin',
	Default = 'Default',
}

export function applyPatch(patches: GraphPatch[], cy: Cytoscape.Core) {
	for (const patch of patches) {
		if (patch.action === 'add') {
			switch (patch.content.type) {
				case 'node':
					switch (patch.content.variant) {
						case 'default':
						case 'symbol':
						case 'connector':
							addNode(cy, patch.content);
							break;
						default:
							break;
					}
					break;
				case 'edge':
					addEdge(cy, patch.content);
					break;
				case 'property':
					addProperty(cy, patch.content);
					break;
				default:
					break;
			}
		}
	}
}

function addNode(cy: Cytoscape.Core, node: GraphNodePatch) {
	const el: ElementDefinition = { data: { id: node.id, label: node.id } };
	if (node.variant === 'connector') {
		el.data.parent = node.id;
	}
	cy.add(el);
}

function addEdge(cy: Cytoscape.Core, edge: GraphEdgePatch) {
	const el: ElementDefinition = {
		data: { id: edge.id, source: edge.sourceId, target: edge.targetId },
	};
	cy.add(el);
}

const addProperty = (cy: Cytoscape.Core, { id, prop }: GraphPropertyPatch) => {
	const elementById = cy.getElementById(id);

	const { key, type, value } = prop;

	console.log('GOT PROP ', JSON.stringify(prop, undefined, 2));
	if (type !== 'custom') {
		switch (key) {
			case 'symbol':
				elementById.data(nodeTypeKey, NodeType.SymbolContainer);
				elementById.data(key, value);
				break;
			case 'connectorRelativePosition':
				elementById.data(nodeTypeKey, NodeType.SymbolConnector);
				elementById.data(key, value);
				break;
			case 'group':
				elementById.move({ parent: value });
				break;
			case 'stroke':
				if (elementById.isEdge()) {
					elementById.data('lineColor', value);
				}
				elementById.data(key, value);
				break;
			case 'fill':
				elementById.data(key, value);
				break;
			default:
				elementById.data(key, value);
		}
	}
};
