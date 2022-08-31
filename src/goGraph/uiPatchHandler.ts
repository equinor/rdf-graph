import { IUiPatchHandler, UiConnectorPatchProperties, UiEdge, UiEdgePatchProperties, UiNodePatchProperties } from '../core/ui/uiNegotiator';
import { BaseNodeData, EdgeData, NodeUiCategory, NodeUiItemCategory, PortData, SymbolNodeData } from './types';

const nodePropMap: Record<keyof UiNodePatchProperties, string> = {
	backgroundColor: 'fill',
	borderColor: 'stroke',
	label: 'label',
	shape: 'shape',
	symbol: '',
};

export class GoJsPatchHandler implements IUiPatchHandler {
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
		const nodeData = this.getNodeData(nodeId);
		if (!nodeData) return;

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
			category: NodeUiItemCategory.Default,
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
		console.warn('<addConnectorProperty> not implemented.');
		console.warn(`id: ${id}, nodeId: ${nodeId}, prop: ${prop}, value: ${value}`);
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
	}

	// Private stuff

	private transactionId: string = '';

	private getNodeData(id: go.Key) {
		return this.diagram.model.findNodeDataForKey(id);
	}
}
