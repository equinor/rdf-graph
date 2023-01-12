import Cytoscape, { ElementDefinition } from 'cytoscape';
import { GraphEdgePatch, GraphNodePatch, GraphPatch, GraphPropertyPatch } from 'core/types/core';
import { UiSymbol } from 'core/types/UiSymbol';
import { imageHeightKey, imageKey, imageWidthKey, layoutIgnoreKey, NodeType, nodeTypeKey } from './common';



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
	const elementById = cy.getElementById(id);

	const { key, type, value } = prop;

	if (type !== 'custom') {
		switch (key) {
			case 'symbol':
				elementById.data(nodeTypeKey, NodeType.SymbolContainer);
				elementById.data(key, value);
				createImageNode(cy, id, value);
				break;
			case 'connectorRelativePosition':
				elementById.data(nodeTypeKey, NodeType.SymbolConnector);
				//elementById.data(layoutIgnoreKey, true);
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


const createImageNode = (cy: Cytoscape.Core, nodeId: string, symbol: UiSymbol) => {
	

	const dataUri = 'data:image/svg+xml;utf8,' + encodeURIComponent(symbol.svg);
	console.log("Creating image node from ", dataUri);

	console.log("imageWidth: ", symbol.width);

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

	console.log("SYMBOL CREATED ", imageElement);


	cy.add(imageElement);
};

const getImageNodeId = (compoundNodeId: string) => `${compoundNodeId.replace('#', 'HASH')}_svg`;
