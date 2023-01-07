import { GraphEdge, GraphNodePatch, GraphPatch, GraphPropertyPatch } from 'core/types/core';

export function applyPatch(patches: GraphPatch[], diagram: go.Diagram) {
	for (const patch of patches) {
		switch (patch.content.type) {
			case 'node':
				switch (patch.content.variant) {
					case 'default':
					case 'symbol':
					case 'connector':
						if (patch.action === 'add') {
							addNode(diagram, patch.content);
						}
						break;
					default:
						break;
				}
				break;
			case 'edge':
				if (patch.action === 'add') {
					addEdge(diagram, patch.content);
				}
				break;
			case 'property':
				addEdgeProp(diagram, patch.content);
				addNodeProp(diagram, patch.content);

			default:
				break;
		}
	}
	console.log();
	diagram.nodes.each((n) => {
		console.log(n.data);
	});
}

function addNode(diagram: go.Diagram, node: GraphNodePatch) {
	diagram.model.addNodeData({
		id: node.id,
		type: node.type,
		variant: node.variant,
		label: node.id,
		category: '',
		ports: [],
		data: {},
	});
}

function addNodeProp(diagram: go.Diagram, propPatch: GraphPropertyPatch) {
	const nodeData = diagram.model.findNodeDataForKey(propPatch.id);
	if (!nodeData) return;
	if (propPatch.prop.type === 'custom') {
		diagram.model.setDataProperty(nodeData, 'data', {
			...nodeData.data,
			[propPatch.prop.key]: propPatch.prop.value,
		});
	} else {
		diagram.model.setDataProperty(nodeData, propPatch.prop.key, propPatch.prop.value);
	}
}

function addEdge(diagram: go.Diagram, edge: GraphEdge) {
	const edgeModel = diagram.model as go.GraphLinksModel;
	const linkData = edgeModel.findLinkDataForKey(edge.id);
	if (!linkData) {
		return;
	}
	(diagram.model as go.GraphLinksModel).addLinkData({
		id: edge.id,
		type: edge.type,
		from: edge.sourceId,
		to: edge.targetId,
	});
}

function addEdgeProp(diagram: go.Diagram, propPatch: GraphPropertyPatch) {
	const linkData = (diagram.model as go.GraphLinksModel).findLinkDataForKey(propPatch.id);

	if (!linkData) return;
	diagram.model.setDataProperty(linkData, propPatch.prop.key, propPatch.prop.value);
}
