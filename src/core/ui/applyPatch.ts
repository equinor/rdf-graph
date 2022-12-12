import { GraphAssertion, GraphNode, GraphPatch } from '../types';
import { applyAssertion } from './applyAssertion';

export type Point = { x: number; y: number };

export type UiNodeShape = 'Circle' | 'Square';

export interface UiNodePatchProperties {
	parent: GraphNode;
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
	isGroup: boolean;
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


export type PatchError = Readonly<{
	message: string;
	error: unknown;
	assertion?: GraphAssertion;
}>;

export interface IUiPatchHandler {
	addNode(id: string): void;
	removeNode(id: string): void;
	addNodeProperty<P extends keyof UiNodePatchProperties>(
		nodeId: string,
		prop: P,
		value: UiNodePatchProperties[P]
	): void;
	removeNodeProperty<P extends keyof UiNodePatchProperties>(nodeId: string, prop: P): void;

	addConnector(id: string, nodeId: string): void;
	removeConnector(id: string, nodeId: string): void;
	addConnectorProperty<P extends keyof UiConnectorPatchProperties>(
		id: string,
		nodeId: string,
		prop: P,
		value: UiConnectorPatchProperties[P]
	): void;
	removeConnectorProperty<P extends keyof UiConnectorPatchProperties>(
		id: string,
		nodeId: string,
		prop: P
	): void;

	addEdge(edge: UiEdge): void;
	removeEdge(edgeId: string): void;
	addEdgeProperty<P extends keyof UiEdgePatchProperties>(
		edgeId: string,
		prop: P,
		value: UiEdgePatchProperties[P]
	): void;
	removeEdgeProperty<P extends keyof UiEdgePatchProperties>(edgeId: string, prop: P): void;

	onPatchError: (error: PatchError) => void;

	onBeforeApplyPatch?: () => void;
	onAfterApplyPatch?: () => void;
}

/** Apply a GraphPatch to the UI using the IUiPatchHandler */
export function applyPatch(graphPatch: GraphPatch, ui: IUiPatchHandler): void {
	ui.onBeforeApplyPatch?.call(ui);

	let patchError: PatchError | null = null;
	let currentAssertion: GraphAssertion | undefined;
	let n = 0;
	try {
		for (const assertion of graphPatch) {
			currentAssertion = assertion;
			applyAssertion(ui, assertion);
			n++;
		}
	} catch (error) {
		let message;

		if (error instanceof Error) {
			message = error.message;
		} else {
			message = String(error);
		}

		patchError = {
			assertion: currentAssertion,
			message,
			error,
		};
	}

	if (patchError) {
		ui.onPatchError(patchError);
	}

	console.log(`${n} assertions applied`);

	ui.onAfterApplyPatch?.call(ui);
}
