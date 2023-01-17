import go from 'gojs';

import {
	GraphEdge,
	GraphNodePatch,
	GraphPatch,
	GraphPropertyPatch,
	KnownPropKey,
	UiSymbol,
} from '../core/types';

import { RdfGoGraphState } from './RdfGoGraph';

export const nodeCategory = {
	default: '',
	symbolWithConnectors: 'symbolWithConnectors',
} as const;

export function applyPatch(patches: GraphPatch[], diagram: go.Diagram, state: RdfGoGraphState) {
	const transactionId = new Date().getTime().toString();
	diagram.startTransaction(transactionId);

	for (const patch of patches) {
		switch (patch.content.type) {
			case 'node':
				switch (patch.content.variant) {
					case 'default':
					case 'symbol':
						if (patch.action === 'add') {
							addNode(diagram, patch.content);
						} else {
							removeNode(diagram, patch.content);
						}
						break;
					case 'connector':
						if (patch.action === 'add') {
							addShadowConnector(diagram, state, patch.content);
						} else {
							removeShadowConnector(diagram, state, patch.content);
						}
						break;
					default:
						break;
				}
				break;
			case 'edge':
				if (patch.action === 'add') {
					addEdge(diagram, state, patch.content);
				} else {
					removeEdge(diagram, patch.content);
				}
				break;
			case 'property':
				if (patch.action === 'add') {
					addEdgeProp(diagram, patch.content);
					addNodeProp(diagram, state, patch.content);
				} else {
					removeNodeProp(diagram, patch.content);
				}

				break;
			default:
				break;
		}
	}

	diagram.commitTransaction(transactionId);

	// console.log('GO NODES');
	// diagram.nodes.each((n) => {
	// 	console.log(n.data);
	// });

	//console.log('GRAPH PATCHES');
	//printPatches(patches);

	//console.log(process.env);
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

function removeNode(diagram: go.Diagram, node: GraphNodePatch) {
	const nodeData = diagram.model.findNodeDataForKey(node.id);
	if (!nodeData) return;
	diagram.model.removeNodeData(nodeData);
}

const ignoredProps: KnownPropKey[] = [
	'connectorIds',
	'connectorDirection',
	'connectorRelativePosition',
];

function addNodeProp(diagram: go.Diagram, state: RdfGoGraphState, propPatch: GraphPropertyPatch) {
	if (ignoredProps.includes(propPatch.prop.key as KnownPropKey)) return;

	const nodeData = diagram.model.findNodeDataForKey(propPatch.id);

	if (!nodeData) {
		if (propPatch.prop.type === 'custom') return;
		addConnectorNodeProp(diagram, state, propPatch);
		return;
	}

	if (propPatch.prop.type === 'custom') {
		diagram.model.setDataProperty(nodeData, 'data', {
			...nodeData.data,
			[propPatch.prop.key]: propPatch.prop.value,
		});
		return;
	}

	if (propPatch.prop.key === 'symbol') {
		const symbol = propPatch.prop.value as UiSymbol;

		diagram.model.setCategoryForNodeData(nodeData, nodeCategory.symbolWithConnectors);
		diagram.model.setDataProperty(nodeData, 'symbolGeometry', symbol.geometry);
		diagram.model.setDataProperty(nodeData, 'symbolHeight', symbol.height);
		diagram.model.setDataProperty(nodeData, 'symbolWidth', symbol.width);

		const ports = symbol.connectors.map((c) => {
			return {
				portId: c.id,
				connectorRelativePosition: new go.Point(c.position.x, c.position.y),
				connectorDirection: c.direction,
			};
		});

		diagram.model.setDataProperty(nodeData, 'ports', ports);

		return;
	}

	if (propPatch.prop.key === 'template') {
		diagram.model.setCategoryForNodeData(nodeData, propPatch.prop.value);
		return;
	}

	diagram.model.setDataProperty(nodeData, propPatch.prop.key, propPatch.prop.value);
}

function addConnectorNodeProp(
	diagram: go.Diagram,
	state: RdfGoGraphState,
	propPatch: GraphPropertyPatch
) {
	if (propPatch.prop.type !== 'custom' && propPatch.prop.key !== 'connectorName') return;

	const portId = propPatch.prop.value;

	if (propPatch.id in state.connectorNodes) {
		state.connectorNodes[propPatch.id].portId = portId;
	} else {
		state.connectorNodes[propPatch.id] = { portId: portId };
	}

	// Update any links that use this connector
	const symbolNodeId = state.connectorNodes[propPatch.id].symbolNodeId;

	if (!symbolNodeId) return;

	const linkMod = diagram.model as go.GraphLinksModel;

	diagram.links.each((link) => {
		const d = link.data;

		if (d.to === symbolNodeId) {
			const exLink = linkMod.findLinkDataForKey(d.id);
			if (exLink) linkMod.setToPortIdForLinkData(exLink, portId);
		}

		if (d.from === symbolNodeId) {
			const exLink = linkMod.findLinkDataForKey(d.id);
			if (exLink) linkMod.setFromPortIdForLinkData(exLink, portId);
		}
	});
}

function removeNodeProp(diagram: go.Diagram, propPatch: GraphPropertyPatch) {
	const nodeData = diagram.model.findNodeDataForKey(propPatch.id);
	if (!nodeData) return;
	if (propPatch.prop.type === 'custom') {
		const newData = { ...nodeData.data };
		delete newData[propPatch.prop.key];
		diagram.model.setDataProperty(nodeData, 'data', newData);
	} else {
		let deleteValue = undefined;
		// Define specific default values for delete props
		switch (propPatch.prop.key) {
			case 'fill':
				deleteValue = 'lightgreen';
				break;
			case 'stroke':
				deleteValue = '#ccc';
				break;
			default:
				break;
		}
		diagram.model.setDataProperty(nodeData, propPatch.prop.key, deleteValue);
	}
}

function addEdge(diagram: go.Diagram, state: RdfGoGraphState, edge: GraphEdge) {
	// Check if 'from' and/or 'to' is a symbol connector
	const sourceConnector = state.connectorNodes[edge.sourceId];
	const targetConnector = state.connectorNodes[edge.targetId];

	let from = edge.sourceId;
	let fromPort = undefined;

	let to = edge.targetId;
	let toPort = undefined;

	if (sourceConnector?.symbolNodeId) {
		from = sourceConnector.symbolNodeId;
		fromPort = sourceConnector.portId;
	}

	if (targetConnector?.symbolNodeId) {
		to = targetConnector.symbolNodeId;
		toPort = targetConnector.portId;
	}

	(diagram.model as go.GraphLinksModel).addLinkData({
		id: edge.id,
		type: edge.type,
		from: from,
		fromPort: fromPort,
		to: to,
		toPort: toPort,
	});
}

function removeEdge(diagram: go.Diagram, edge: GraphEdge): void {
	const link = (diagram.model as go.GraphLinksModel).findLinkDataForKey(edge.id);
	if (!link) return;
	(diagram.model as go.GraphLinksModel).removeLinkData(link);
}

function addEdgeProp(diagram: go.Diagram, propPatch: GraphPropertyPatch) {
	const linkData = (diagram.model as go.GraphLinksModel).findLinkDataForKey(propPatch.id);

	if (!linkData) return;
	diagram.model.setDataProperty(linkData, propPatch.prop.key, propPatch.prop.value);
}

function addShadowConnector(
	_diagram: go.Diagram,
	state: RdfGoGraphState,
	connector: GraphNodePatch
) {
	if (!connector.symbolNodeId) return;

	if (connector.id in state.connectorNodes) {
		state.connectorNodes[connector.id].symbolNodeId = connector.symbolNodeId;
	} else {
		state.connectorNodes[connector.id] = { symbolNodeId: connector.symbolNodeId };
	}
}

function removeShadowConnector(
	_diagram: go.Diagram,
	state: RdfGoGraphState,
	connector: GraphNodePatch
) {
	if (connector.id in state.connectorNodes) {
		delete state.connectorNodes[connector.id];
	}
}
