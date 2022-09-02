type NodeDataCache = {
	symbolId: string | null;
	connectors: Map<string, ConnectorData>;
};

type ConnectorData = {
	name: string | null;
};

/** Store for node data used for UI synchronization.
 *
 * As per now, for each node that has been added to the UI, the UiNegotiator needs to know
 * the symbolId and the link between connector name (ex.: c2) and connectorId (ex.: iri).
 * This information is used to retrieve/update symbol data (ex.: connector position and direction)
 * for connectors that have been added to a node before the symbolId has been added.
 * A symbol connector could be added (with 'name=c2') before the node property 'symbolId' is added,
 * thus the UiNegotiator needs to know which connectors to update/sync.
 */
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
