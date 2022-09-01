import go from 'gojs';
import { IUiPatchHandler, UiConnectorPatchProperties, UiEdge, UiEdgePatchProperties, UiNodePatchProperties } from '../core/ui/uiNegotiator';
import { getNodeSymbolTemplate } from '../symbol-api';
import { BaseNodeData, EdgeData, NodeUiCategory, NodeUiItemCategory, PortData, SymbolNodeData } from './types';

const nodePropMap: Record<keyof UiNodePatchProperties, string> = {
	backgroundColor: 'fill',
	borderColor: 'stroke',
	label: 'label',
	shape: 'shape',
	symbolId: 'symbolId',
	nodeTemplate: 'nodeTemplate',
};

export class GoJsPatchHandler implements IUiPatchHandler {
	private _linkModel(): go.GraphLinksModel {
		return this.diagram.model as go.GraphLinksModel;
	}

	constructor(readonly diagram: go.Diagram) {}

	addNode(id: string): void {
		const n: BaseNodeData = {
			type: 'node',
			id: id,
			category: NodeUiCategory.Default,
			ports: [],
		};
		this.diagram.model.addNodeData(n);
	}

	removeNode(id: string): void {
		const nodeData = this.getNodeData(id);
		if (!nodeData) return;
		this.diagram.model.removeNodeData(nodeData);
	}

	addNodeProperty<P extends keyof UiNodePatchProperties>(nodeId: string, prop: P, value: UiNodePatchProperties[P]): void {
		const nodeData = this.getNodeData(nodeId) as BaseNodeData;
		if (!nodeData) return;

		if (prop === 'symbolId') {
			const symbol = getNodeSymbolTemplate(value);
			this.diagram.model.setCategoryForNodeData(nodeData, NodeUiCategory.SvgSymbol);
			this.diagram.model.setDataProperty(nodeData, 'width', symbol.width);
			this.diagram.model.setDataProperty(nodeData, 'height', symbol.height);
			this.diagram.model.setDataProperty(nodeData, 'symbolId', value);
			this.diagram.model.setDataProperty(nodeData, 'symbolConnectors', symbol.connectors);

			// Add port information (from symbol.connectors) to any existing ports
			if (nodeData.ports) this.syncSymbolPorts(nodeId);
			return;
		}

		// NOTE: Not sure if the "nodeTemplate" is needed at this point (se ESD example)
		// Seems to work fine using the default node template.
		if (prop === 'nodeTemplate') {
			let cat = NodeUiCategory.Default;

			switch (value) {
				case 'BorderConnectorTemplate':
					cat = NodeUiCategory.EdgeConnectorNode;
					break;

				default:
					break;
			}
			this.diagram.model.setCategoryForNodeData(nodeData, cat);
			return;
		}

		// Set property directly using map
		const nodePropKey = nodePropMap[prop];
		this.diagram.model.setDataProperty(nodeData, nodePropKey, value);
	}

	removeNodeProperty<P extends keyof UiNodePatchProperties>(nodeId: string, prop: P): void {
		const nodeData = this.getNodeData(nodeId);
		if (!nodeData) return;

		const nodePropKey = nodePropMap[prop];
		this.diagram.model.setDataProperty(nodeData, nodePropKey, undefined);
	}

	addConnector(id: string, nodeId: string): void {
		const nodeData = this.getNodeData(nodeId) as BaseNodeData;

		const port: PortData = {
			type: 'port',
			category: NodeUiItemCategory.PositionPort,
			id: id,
			portId: id,
		};

		if (nodeData.ports) {
			this.diagram.model.insertArrayItem(nodeData.ports, -1, port);
		} else {
			this.diagram.model.setDataProperty(nodeData, 'ports', [port]);
		}
	}

	removeConnector(id: string, nodeId: string): void {
		const nodeData = this.getNodeData(nodeId) as BaseNodeData;
		if (!nodeData.ports) return;

		const ports = nodeData.ports as PortData[];
		const portIdx = ports.findIndex((p) => p.id === id);
		if (portIdx < 0) {
			console.error(`port ${id} not found on node ${nodeId}`);
			return;
		}
		this.diagram.model.removeArrayItem(nodeData.ports, portIdx);
	}

	addConnectorProperty<P extends keyof UiConnectorPatchProperties>(
		id: string,
		nodeId: string,
		prop: P,
		value: UiConnectorPatchProperties[P]
	): void {
		//console.warn('<addConnectorProperty> not implemented.');
		//console.warn(`id: ${id}, nodeId: ${nodeId}, prop: ${prop}, value: ${value}`);

		const nodeData = this.getNodeData(nodeId) as BaseNodeData;
		const portIdx = nodeData.ports.findIndex((p) => p.id === id);

		if (portIdx < 0 && typeof portIdx != 'number') {
			console.warn(`Could not find port ${id} on node ${nodeId}`);
			return;
		}

		const model = this.diagram.model as go.GraphLinksModel;

		switch (prop) {
			case 'name':
				model.set(nodeData.ports[portIdx], 'name', value);
				this.syncSymbolPorts(nodeId);
				break;
			case 'normalDirection':
				break;
			case 'color':
				break;
			case 'position':
				break;
			default:
				break;
		}
	}

	removeConnectorProperty<P extends keyof UiConnectorPatchProperties>(id: string, nodeId: string, prop: P): void {
		console.warn('<removeConnectorProperty> not implemented.');
		console.warn(`id: ${id}, nodeId: ${nodeId}, prop: ${prop}`);
	}

	addEdge(edge: UiEdge): void {
		const edgeData: EdgeData = {
			type: 'edge',
			id: edge.edgeId,
			from: edge.fromNode,
			fromPort: edge.fromConnector,
			to: edge.toNode,
			toPort: edge.toConnector,
		};

		(this.diagram.model as go.GraphLinksModel).addLinkData(edgeData);
	}

	removeEdge(edgeId: string): void {
		const link = (this.diagram.model as go.GraphLinksModel).findLinkDataForKey(edgeId);
		if (!link) return;
		(this.diagram.model as go.GraphLinksModel).removeLinkData(link);
	}

	addEdgeProperty<P extends keyof UiEdgePatchProperties>(edgeId: string, prop: P, value: UiEdgePatchProperties[P]): void {
		console.warn('<addEdgeProperty> not implemented.');
	}
	removeEdgeProperty<P extends keyof UiEdgePatchProperties>(edgeId: string, prop: P): void {
		console.warn('<removeEdgeProperty> not implemented.');
	}

	onBeforeApplyPatch() {
		this.transactionId = 'patch_' + Date.now();
		this.diagram.startTransaction(this.transactionId);
	}

	onAfterApplyPatch() {
		this.diagram.commitTransaction(this.transactionId);
		this.transactionId = '';

		// Handy console logs for debug.
		// console.log({ ...this.diagram.model.nodeDataArray });
		// console.log({ ...(this.diagram.model as go.GraphLinksModel).linkDataArray });
	}

	// Private stuff

	private transactionId: string = '';

	private getNodeData(id: go.Key) {
		return this.diagram.model.findNodeDataForKey(id);
	}

	/** Syncs node ports and the node's symbol connectors.
	 *  We need to get direction and position from the symbol port data
	 */
	private syncSymbolPorts(nodeId: string) {
		const nodeData = this.getNodeData(nodeId) as SymbolNodeData;

		if (!nodeData.symbolConnectors) return;

		for (let i = 0; i < nodeData.ports.length; i++) {
			const p = nodeData.ports[i];
			const c = nodeData.symbolConnectors.find((co) => co.id === p.name);

			if (!c) continue;
			this.diagram.model.setDataProperty(p, 'direction', c.portDirection);
			this.diagram.model.setDataProperty(p, 'relativePosition', new go.Point(c.point.x, c.point.y));
			this.diagram.model.setDataProperty(p, 'category', NodeUiItemCategory.PositionPort);
		}
	}
}
