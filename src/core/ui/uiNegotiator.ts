import { nodeTemplateKey } from '../mapper/predicates';
import { Assertion, GraphConnector, GraphEdge, GraphNode, GraphPatch, GraphProperty, GraphPropertyTarget } from '../types';
import { UiNegotiatorNodeStore } from './UiNegotiatorNodeStore';

export type Point = { x: number; y: number };

export type UiNodeShape = 'Circle' | 'Square';

export interface UiNodePatchProperties {
	backgroundColor: string;
	borderColor: string;
	highlightBorderColor: string;
	highlight: boolean;
	label: string;
	shape: UiNodeShape;
	nodeTemplate: string;
	symbolId: string;
	symbolWidth: number;
	symbolHeight: number;
}

export interface UiEdge {
	edgeId: string;
	fromNode: string;
	fromConnector?: string;
	toNode: string;
	toConnector?: string;
}

export interface UiEdgePatchProperties {
	color: string;
	highlightColor: string;
	highlight: boolean;
	thickness: string;
}

export interface UiConnectorPatchProperties {
	name: string;
	color: string;
	position: Point | 'Left' | 'Right' | 'Top' | 'Bottom';
	/** The angle that the connector has to  */
	normalDirection: number;
}

export interface UiNodeSymbol {
	id: string;
	width: number;
	height: number;
	//angle?: number;
	svg?: string;
	connectors: UiNodeConnector[];
}

export interface UiNodeConnector {
	id: string;
	width: number;
	height: number;
	direction: number;
	position: Point | 'Left' | 'Right' | 'Top' | 'Bottom';
}

export interface IUiPatchHandler {
	addNode(id: string): void;
	removeNode(id: string): void;
	addNodeProperty<P extends keyof UiNodePatchProperties>(nodeId: string, prop: P, value: UiNodePatchProperties[P]): void;
	removeNodeProperty<P extends keyof UiNodePatchProperties>(nodeId: string, prop: P): void;

	addConnector(id: string, nodeId: string): void;
	removeConnector(id: string, nodeId: string): void;
	addConnectorProperty<P extends keyof UiConnectorPatchProperties>(id: string, nodeId: string, prop: P, value: UiConnectorPatchProperties[P]): void;
	removeConnectorProperty<P extends keyof UiConnectorPatchProperties>(id: string, nodeId: string, prop: P): void;

	addEdge(edge: UiEdge): void;
	removeEdge(edgeId: string): void;
	addEdgeProperty<P extends keyof UiEdgePatchProperties>(edgeId: string, prop: P, value: UiEdgePatchProperties[P]): void;
	removeEdgeProperty<P extends keyof UiEdgePatchProperties>(edgeId: string, prop: P): void;

	getNodeSymbol(id: string): UiNodeSymbol;

	onBeforeApplyPatch?: () => void;
	onAfterApplyPatch?: () => void;
}

// Future UiNegotiator options
export type UiNegotiatorOptions = {};
export const UiNegotiatorDefaultOptions = {} as const;

/**  */
export class UiNegotiator {
	// In memory symbol store
	private _nodeSymbols: Map<string, Readonly<UiNodeSymbol> | undefined> = new Map();

	// In memory store of basic node data
	private _nodes = new UiNegotiatorNodeStore();

	constructor(readonly ui: IUiPatchHandler, readonly options: UiNegotiatorOptions = UiNegotiatorDefaultOptions) {}

	/** Apply a GraphPatch to the UI using the IUiPatchHandler */
	applyPatch(graphPatch: GraphPatch): void {
		// Invoke onBeforeApplyPatch if defined
		this.ui.onBeforeApplyPatch?.call(this.ui);

		for (const { action, assertion } of graphPatch) {
			switch (assertion.type) {
				case 'node':
					this.patchNode({ action, assertion });
					break;
				case 'edge':
					this.patchEdge({ action, assertion });
					break;
				case 'connector':
					this.patchConnector({ action, assertion });
					break;
				case 'property':
					this.patchProperty({ action, assertion });
					break;
				default:
					continue;
			}
			// MARTIN: Handy console logs for debug. We will remove when this class is finished.
			// console.log(
			// 	action.toUpperCase() +
			// 		': ' +
			// 		assertion.type +
			// 		' - ' +
			// 		(assertion.target as GraphPropertyTarget)?.type +
			// 		' - ' +
			// 		assertion.key +
			// 		' - ' +
			// 		JSON.stringify(assertion.value)
			// );
		}

		// Invoke onAfterApplyPatch if defined
		this.ui.onAfterApplyPatch?.call(this.ui);
	}

	/** Add or Remove node */
	private patchNode({ action, assertion }: Assertion<GraphNode>) {
		if (action === 'add') {
			this.ui.addNode(assertion.id);
			// Add in-mem node data
			this._nodes.addNode(assertion.id);
		} else {
			this.ui.removeNode(assertion.id);
			this._nodes.removeNode(assertion.id);
		}
	}

	/** Add or Remove edge */
	private patchEdge({ action, assertion }: Assertion<GraphEdge>) {
		if (action === 'add')
			this.ui.addEdge({
				edgeId: assertion.id,
				fromNode: assertion.source,
				fromConnector: assertion.sourceConnector,
				toNode: assertion.target,
				toConnector: assertion.targetConnector,
			});
		else this.ui.removeEdge(assertion.id);
	}

	/** Add or Remove node connector */
	private patchConnector({ action, assertion }: Assertion<GraphConnector>) {
		if (action === 'add') {
			this._nodes.addConnector(assertion.node.id, assertion.id);
			this.ui.addConnector(assertion.id, assertion.node.id);
		} else {
			this.ui.removeNode(assertion.id);
			this._nodes.removeConnector(assertion.node.id, assertion.id);
		}
	}

	/** Add or remove property on a node, edge or connector */
	private patchProperty({ action, assertion }: Assertion<GraphProperty<GraphPropertyTarget>>) {
		switch (assertion.target.type) {
			case 'node':
				this.patchNodeProperty({ action, assertion } as Assertion<GraphProperty<GraphNode>>);
				break;
			case 'connector':
				this.patchConnectorProperty({ action, assertion } as Assertion<GraphProperty<GraphConnector>>);
				break;
			case 'edge':
				this.patchEdgeProperty({ action, assertion } as Assertion<GraphProperty<GraphEdge>>);
				break;
			default:
				return;
		}
	}

	/** Add or remove node property */
	private patchNodeProperty({ action, assertion }: Assertion<GraphProperty<GraphNode>>) {
		let propKey: keyof UiNodePatchProperties;

		switch (assertion.key) {
			case 'label':
				propKey = 'label';
				break;
			case nodeTemplateKey:
				propKey = 'nodeTemplate';
				break;
			case 'highlight':
				propKey = 'highlight';
				break;
			case 'highlightStrokeColor':
				propKey = 'highlightBorderColor';
				break;
			case 'symbolName':
				// Special handling for symbols
				this.patchNodeSymbol({ action, assertion });
				return;
			default:
				return;
		}

		if (action === 'add') {
			this.ui.addNodeProperty(assertion.target.id, propKey, assertion.value);
		} else this.ui.removeNodeProperty(assertion.target.id, propKey);
	}

	/** Add or remove connector property */
	private patchConnectorProperty({ action, assertion }: Assertion<GraphProperty<GraphConnector>>) {
		let propKey: keyof UiConnectorPatchProperties;

		switch (assertion.key) {
			case 'connectorName':
				propKey = 'name';
				break;
			case 'direction':
				propKey = 'normalDirection';
				break;

			default:
				return;
		}

		if (action === 'add') this.ui.addConnectorProperty(assertion.target.id, assertion.target.node.id, propKey, assertion.value);
		else this.ui.removeConnectorProperty(assertion.target.id, assertion.target.node.id, propKey);

		// Side effects when connector 'name' property is set
		if (propKey === 'name') {
			// Store connector name in in-mem store
			this._nodes.setConnectorData(assertion.target.node.id, assertion.target.id, { name: action === 'add' ? assertion.value : null });
			// When a connector gets its name, we can update/sync the node's connector
			// data (ie. position and direction). Unlike the connector 'name', this data does not come
			// from an add-assertion, but is retrieved from the IUiPatchHandler.getNodeSymbol() func.
			this.syncSymbolConnectors(assertion.target.node.id);
		}
	}

	/** Add or remove edge property  */
	private patchEdgeProperty({ action, assertion }: Assertion<GraphProperty<GraphEdge>>) {
		let propKey: keyof UiEdgePatchProperties;

		switch (assertion.key) {
			case 'highlight':
				propKey = 'highlight';
				break;
			case 'highlightStrokeColor':
				propKey = 'highlightColor';
				break;
			case 'direction':
				propKey = 'thickness';
				break;
			default:
				return;
		}

		if (action === 'add') this.ui.addEdgeProperty(assertion.target.id, propKey, assertion.value);
		else this.ui.removeEdgeProperty(assertion.target.id, propKey);
	}

	/** Add or remove symbol data to a node */
	private patchNodeSymbol({ action, assertion }: Assertion<GraphProperty<GraphNode>>) {
		const symbolId = assertion.value;

		if (action === 'add') {
			// When we add a symbol (symbolId) to a node, we also retrieve extra symbol information
			// from the patch handler and set it immediately.

			this.ui.addNodeProperty(assertion.target.id, 'symbolId', symbolId);

			// Store the symbolId in the in-memory store, so that we can synchronize the node
			// connectors at a later stage.
			const _node = this._nodes.nodes[assertion.target.id];
			if (_node) _node.symbolId = symbolId;

			const symbol = this.getUiNodeSymbol(symbolId);
			if (!symbol) return;
			this.ui.addNodeProperty(assertion.target.id, 'symbolWidth', symbol.width);
			this.ui.addNodeProperty(assertion.target.id, 'symbolHeight', symbol.height);

			this.syncSymbolConnectors(assertion.target.id);
		} else {
			// TODO: implement remove action?
		}
	}

	/** Syncs node connectors and the node's symbol connectors.
	 *  We need to get direction and position from the symbol port data
	 */
	private syncSymbolConnectors(nodeId: string) {
		const node = this._nodes.nodes[nodeId];
		if (!node || node.symbolId === null) return;

		const symbol = this.getUiNodeSymbol(node.symbolId);
		if (!symbol) return;

		for (const [k, v] of node.connectors) {
			const c = symbol.connectors.find((co) => co.id === v.name);
			if (!c) continue;

			this.ui.addConnectorProperty(k, nodeId, 'normalDirection', c.direction);
			this.ui.addConnectorProperty(k, nodeId, 'position', c.position);
		}
	}

	/** Get symbol from patch handler. Data is stored in memory for later use. */
	private getUiNodeSymbol(id: string): UiNodeSymbol | undefined {
		if (this._nodeSymbols.has(id)) return this._nodeSymbols.get(id);
		const symbol = this.ui.getNodeSymbol(id);
		if (!symbol) {
			console.error('Symbol not found:', id);
			return;
		}
		this._nodeSymbols.set(id, symbol);
		return symbol;
	}
}
