import go from 'gojs';
import {
	IUiPatchHandler,
	Point,
	UiConnectorPatchProperties,
	UiEdge,
	UiEdgePatchProperties,
	UiNodePatchProperties,
	UiNodeSymbol,
} from '../core/ui/applyPatch';
import { BaseNodeData, EdgeData, NodeUiCategory, NodeUiItemCategory, PortData } from './types';

const nodePropMap: Record<keyof UiNodePatchProperties, string> = {
	backgroundColor: 'fill',
	borderColor: 'stroke',
	highlight: 'highlight',
	highlightBorderColor: 'highlightBorderColor',
	label: 'label',
	shape: 'shape',
	symbolId: 'symbolId',
	symbolGeometry: 'symbolGeometry',
	symbol: 'symbol',
	nodeTemplate: 'nodeTemplate',
	symbolHeight: 'symbolHeight',
	symbolWidth: 'symbolWidth',
};

const edgePropMap: Record<keyof UiEdgePatchProperties, string> = {
	color: 'color',
	highlight: 'highlight',
	highlightColor: 'highlightColor',
	thickness: 'stroke',
};

const connectorPropMap: Record<keyof UiConnectorPatchProperties, string> = {
	color: 'color',
	name: 'name',
	connectorDirection: 'direction',
	connectorRelativePosition: 'relativePosition',
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
		const nodeData = this._getNodeData(id);
		if (!nodeData) return;
		this.diagram.model.removeNodeData(nodeData);
	}

	addNodeProperty<P extends keyof UiNodePatchProperties>(nodeId: string, prop: P, value: UiNodePatchProperties[P]): void {
		const nodeData = this._getNodeData(nodeId) as BaseNodeData;
		if (!nodeData) return;

		if (prop === 'symbol') {
			const symbol = value as UiNodeSymbol;

			this.diagram.model.setCategoryForNodeData(nodeData, NodeUiCategory.SvgSymbol);
			this.diagram.model.setDataProperty(nodeData, 'symbolGeometry', symbol.geometry);
			this.diagram.model.setDataProperty(nodeData, 'symbolHeight', symbol.height);
			this.diagram.model.setDataProperty(nodeData, 'symbolWidth', symbol.width);
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

		const nodePropKey = nodePropMap[prop];
		this.diagram.model.setDataProperty(nodeData, nodePropKey, value);
	}

	removeNodeProperty<P extends keyof UiNodePatchProperties>(nodeId: string, prop: P): void {
		const nodeData = this._getNodeData(nodeId);
		if (!nodeData) return;

		const nodePropKey = nodePropMap[prop];
		const currentValue = nodeData[nodePropKey];

		let newValue = undefined;

		switch (typeof currentValue) {
			case 'boolean':
				newValue = false;
				break;
			default:
				break;
		}

		this.diagram.model.setDataProperty(nodeData, nodePropKey, newValue);
	}

	addConnector(id: string, nodeId: string): void {
		const nodeData = this._getNodeData(nodeId) as BaseNodeData;

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
		const nodeData = this._getNodeData(nodeId) as BaseNodeData;
		if (!nodeData.ports) return;

		const ports = nodeData.ports as PortData[];
		const portIdx = ports.findIndex((p) => p.id === id);
		if (portIdx < 0) {
			console.error(`Port '${id}' not found on node ${nodeId}`);
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
		const nodeData = this._getNodeData(nodeId) as BaseNodeData;
		const portIdx = nodeData.ports.findIndex((p) => p.id === id);

		if (portIdx < 0 && typeof portIdx != 'number') {
			console.warn(`Could not find port ${id} on node ${nodeId}`);
			return;
		}

		let commitValue: UiConnectorPatchProperties[P] | unknown = value;

		if (prop === 'connectorRelativePosition') {
			const p = value as Point;
			commitValue = new go.Point(p.x, p.y);
		}

		const connectorPropKey = connectorPropMap[prop];
		this.diagram.model.set(nodeData.ports[portIdx], connectorPropKey, commitValue);
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

		this._linkModel.addLinkData(edgeData);
	}

	removeEdge(edgeId: string): void {
		const link = this._linkModel.findLinkDataForKey(edgeId);
		if (!link) return;
		this._linkModel.removeLinkData(link);
	}

	addEdgeProperty<P extends keyof UiEdgePatchProperties>(edgeId: string, prop: P, value: UiEdgePatchProperties[P]): void {
		const linkData = this._linkModel.findLinkDataForKey(edgeId);
		if (!linkData) return;

		const edgePropKey = edgePropMap[prop];
		this.diagram.model.setDataProperty(linkData, edgePropKey, value);
	}

	removeEdgeProperty<P extends keyof UiEdgePatchProperties>(edgeId: string, prop: P): void {
		const linkData = this._linkModel.findLinkDataForKey(edgeId);
		if (!linkData) return;

		const edgePropKey = edgePropMap[prop];
		const currentValue = linkData[edgePropKey];

		let newValue = undefined;

		switch (typeof currentValue) {
			case 'boolean':
				newValue = false;
				break;
			default:
				break;
		}

		this.diagram.model.setDataProperty(linkData, edgePropKey, newValue);
	}

	onBeforeApplyPatch() {
		this.transactionId = 'patch_' + Date.now();
		this.diagram.startTransaction(this.transactionId);
	}

	onAfterApplyPatch() {
		this.diagram.commitTransaction(this.transactionId);
		console.info('GoJS Transaction completed:', this.transactionId);
		this.transactionId = '';

		// Handy console logs for debug.
		// console.log({ ...this.diagram.model.nodeDataArray });
		// console.log({ ...(this.diagram.model as go.GraphLinksModel).linkDataArray });
	}

	// Private stuff

	private transactionId: string = '';

	private _getNodeData(id: go.Key) {
		return this.diagram.model.findNodeDataForKey(id);
	}

	private get _linkModel(): go.GraphLinksModel {
		return this.diagram.model as go.GraphLinksModel;
	}
}