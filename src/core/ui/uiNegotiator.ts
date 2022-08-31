import { Assertion, GraphConnector, GraphEdge, GraphNode, GraphPatch, GraphProperty, GraphPropertyTarget } from '../types';

export type Point = { x: number; y: number };

export type UiNodeShape = 'Circle' | 'Square';

export interface UiNodePatchProperties {
	backgroundColor: string;
	borderColor: string;
	label: string;
	shape: UiNodeShape;
	symbol: string;
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
	thickness: string;
}

export interface UiConnectorPatchProperties {
	name: string;
	color: string;
	position: Point | 'Left' | 'Right' | 'Top' | 'Bottom';
	/** The angle that the connector has to  */
	normalDirection: number;
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

	onBeforeApplyPatch?: () => void;
	onAfterApplyPatch?: () => void;
}

export type UiNegotiatorOptions = {};

const UiNegotiatorDefaultOptions = {} as const;

/**  */
export class UiNegotiator {
	constructor(readonly ui: IUiPatchHandler, readonly options: UiNegotiatorOptions = UiNegotiatorDefaultOptions) {}

	/**  */
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
					break;
			}
		}
		// Invoke onAfterApplyPatch if defined
		this.ui.onAfterApplyPatch?.call(this.ui);
	}

	/** Add or Remove node */
	private patchNode({ action, assertion }: Assertion<GraphNode>) {
		if (action === 'add') this.ui.addNode(assertion.id);
		else this.ui.removeNode(assertion.id);
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
		if (action === 'add') this.ui.addConnector(assertion.id, assertion.node.id);
		else this.ui.removeNode(assertion.id);
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
			case 'symbolName':
				propKey = 'symbol';
				break;
			// case 'direction':
			// 	propKey = 'normalDirection';
			// 	break;
			default:
				return;
		}

		if (action === 'add') this.ui.addNodeProperty(assertion.target.id, propKey, assertion.value);
		else this.ui.removeNodeProperty(assertion.target.id, propKey);
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
	}

	/** Add or remove connector property */
	private patchEdgeProperty({ action, assertion }: Assertion<GraphProperty<GraphEdge>>) {
		let propKey: keyof UiEdgePatchProperties;

		switch (assertion.key) {
			case 'connectorName':
				propKey = 'color';
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
}
