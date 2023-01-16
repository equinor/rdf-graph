import Cytoscape, { ElementDefinition } from 'cytoscape';
import { GraphEdgePatch, GraphNodePatch, GraphPatch, GraphPropertyPatch } from 'core/types/core';
import { UiSymbol } from 'core/types/UiSymbol';
import {
	imageHeightKey,
	imageKey,
	imageWidthKey,
	layoutIgnoreKey,
	NodeType,
	nodeTypeKey,
} from './common';

export function internalApplyPatches(patches: GraphPatch[], cy: Cytoscape.Core) {
	for (const current of patches) {
		applyPatch(cy, current);
	}
}

function applyPatch(cy: Cytoscape.Core, patch: GraphPatch) {
	if (patch.action === 'add') {
		switch (patch.content.type) {
			case 'node':
				switch (patch.content.variant) {
					case 'default':
					case 'symbol':
						addNode(cy, patch.content);
						break;
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
	} else if (patch.action === 'remove') {
		switch (patch.content.type) {
			case 'edge':
			case 'node':
				removeElement(cy, patch.content);
				break;
			case 'property':
				removeProperty(cy, patch.content);
				break;
		}
		return;
	}
}

function addNode(cy: Cytoscape.Core, node: GraphNodePatch) {
	const el: ElementDefinition = { data: { id: node.id, label: node.id } };
	console.log('variant: ', node.variant);
	if (node.variant === 'connector') {
		el.data.parent = node.symbolNodeId;
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
	const currentElement = cy.getElementById(id);

	const { key, type, value } = prop;

	if (type !== 'custom') {
		switch (key) {
			case 'symbol':
				currentElement.data(nodeTypeKey, NodeType.SymbolContainer);
				currentElement.data(key, value);
				createImageNode(cy, id, value);
				break;
			case 'connectorRelativePosition':
				currentElement.data(nodeTypeKey, NodeType.SymbolConnector);
				currentElement.data(layoutIgnoreKey, true);
				currentElement.data(key, value);
				break;
			case 'group':
				currentElement.move({ parent: value });
				const parent = cy.getElementById(value);
				parent.data(nodeTypeKey, NodeType.Parent)
				break;
			case 'stroke':
				if (currentElement.isEdge()) {
					currentElement.data('lineColor', value);
				}
				currentElement.data(key, value);
				break;
			case 'fill':
				currentElement.data(key, value);
				break;
			default:
				currentElement.data(key, value);
		}
	}
};

const removeElement = (cy: Cytoscape.Core, { id }: GraphNodePatch | GraphEdgePatch) => {
	cy.remove(cy.getElementById(id));
};
const removeProperty = (cy: Cytoscape.Core, { id, prop }: GraphPropertyPatch) => {
	const element = cy.getElementById(id);
	element.removeData(prop.key);
	const isRelPos = prop.type === 'derived' && prop.key === 'connectorRelativePosition';
	const isSymbol = prop.type === 'derived' && prop.key === 'symbol';
	if (isRelPos || isSymbol) {
		element.removeData(nodeTypeKey);
	}
	if (prop.type === 'derived' && prop.key === 'symbol') {
		removeImageNode(cy, id);
	}
};

const removeImageNode = (cy: Cytoscape.Core, compoundNodeId: string) => {
	cy.remove(`[id = "${getImageNodeId(compoundNodeId)}"]`);
};

const createImageNode = (cy: Cytoscape.Core, nodeId: string, symbol: UiSymbol) => {
	const dataUri = 'data:image/svg+xml;utf8,' + encodeURIComponent(symbol.svg);

	const imageElement: ElementDefinition = {
		data: {
			id: getImageNodeId(nodeId),
			[nodeTypeKey]: NodeType.SymbolImage,
			[imageKey]: dataUri,
			[imageWidthKey]: symbol.width,
			[imageHeightKey]: symbol.height,
			[layoutIgnoreKey]: true,
			parent: nodeId,
		},
		position: { x: 0, y: 0 },
	};

	cy.add(imageElement);
};

const getImageNodeId = (compoundNodeId: string) => `${compoundNodeId.replace('#', 'HASH')}_svg`;
