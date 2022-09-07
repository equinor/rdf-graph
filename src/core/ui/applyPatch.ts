import { GraphPatch } from '../types';

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
	symbol: UiNodeSymbol;
	symbolWidth: number;
	symbolHeight: number;
	symbolGeometry: string;
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
	connectorRelativePosition: Point | 'Left' | 'Right' | 'Top' | 'Bottom';
	/** The angle that the connector arm has to the node at default rotation */
	connectorDirection: number;
}

export interface UiNodeSymbol {
	id: string;
	width: number;
	height: number;
	angle?: number;
	svg?: string;
	/** Symbol as single svg <path> element value */
	geometry?: string;
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

	onBeforeApplyPatch?: () => void;
	onAfterApplyPatch?: () => void;
}

/** Apply a GraphPatch to the UI using the IUiPatchHandler */
export function applyPatch(graphPatch: GraphPatch, ui: IUiPatchHandler): void {
	ui.onBeforeApplyPatch?.call(ui);

	for (const { action, assertion } of graphPatch) {
		switch (assertion.type) {
			case 'node':
				if (action === 'add') ui.addNode(assertion.id);
				else ui.removeNode(assertion.id);
				break;
			case 'edge':
				if (action === 'add')
					ui.addEdge({
						edgeId: assertion.id,
						fromNode: assertion.source,
						fromConnector: assertion.sourceConnector,
						toNode: assertion.target,
						toConnector: assertion.targetConnector,
					});
				else ui.removeEdge(assertion.id);
				break;
			case 'connector':
				if (action === 'add') ui.addConnector(assertion.id, assertion.node.id);
				else ui.removeNode(assertion.id);
				break;
			case 'property':
				switch (assertion.target.type) {
					case 'node':
						if (action === 'add') ui.addNodeProperty(assertion.target.id, assertion.key as keyof UiNodePatchProperties, assertion.value);
						else ui.removeNodeProperty(assertion.target.id, assertion.key as keyof UiNodePatchProperties);
						break;
					case 'connector':
						if (action === 'add')
							ui.addConnectorProperty(
								assertion.target.id,
								assertion.target.node.id,
								assertion.key as keyof UiConnectorPatchProperties,
								assertion.value
							);
						else
							ui.removeConnectorProperty(
								assertion.target.id,
								assertion.target.node.id,
								assertion.key as keyof UiConnectorPatchProperties
							);
						break;
					case 'edge':
						if (action === 'add') ui.addEdgeProperty(assertion.target.id, assertion.key as keyof UiEdgePatchProperties, assertion.value);
						else ui.removeEdgeProperty(assertion.target.id, assertion.key as keyof UiEdgePatchProperties);
						break;
					default:
						return;
				}
				break;
			default:
				break;
		}
	}

	ui.onAfterApplyPatch?.call(ui);
}
