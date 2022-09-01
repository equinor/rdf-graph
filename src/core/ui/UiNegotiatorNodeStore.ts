type NodeDataCache = {
	symbolId: string | null;
	connectors: Map<string, ConnectorData>;
};

type ConnectorData = {
	name: string | null;
};

export class UiNegotiatorNodeStore {
	private _nodes: Record<string, NodeDataCache> = {};

	get nodes(): Record<string, NodeDataCache> {
		return this._nodes;
	}

	addNode(nodeId: string): void {
		const node = this._nodes[nodeId];
		if (node) return;
		this._nodes[nodeId] = { symbolId: null, connectors: new Map() };
	}

	removeNode(nodeId: string): void {
		const node = this._nodes[nodeId];
		if (!node) return;
		delete this._nodes[nodeId];
	}

	addConnector(nodeId: string, connectorId: string): void {
		const node = this._nodes[nodeId];
		if (!node) return;
		if (!node.connectors.has(connectorId)) node.connectors.set(connectorId, { name: null });
	}

	setConnectorData(nodeId: string, connectorId: string, data: ConnectorData): void {
		const node = this._nodes[nodeId];
		if (!node) return;
		const currentData = node.connectors.get(connectorId);
		node.connectors.set(connectorId, { ...currentData, ...data });
	}

	removeConnector(nodeId: string, connectorId: string): void {
		const node = this._nodes[nodeId];
		if (!node) return;
		if (node.connectors.has(connectorId)) node.connectors.delete(connectorId);
	}
}
