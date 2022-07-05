import { hasConnectorIri } from '../../../mapper/predicates';
import { GraphPatch } from '../../../models';

export type UiAction = 'addNode' | 'removeNode' | 'addNodeConnector' | 'removeNodeConnector' | 'addLink' | 'removeLink' | 'setProperty';

export type UiNodeType = 'BasicShape' | 'SvgSymbol' | 'Picture' | 'ConnectorBlock';

export type Point = { x: number; y: number };

export type ConnectorPosition = Point | 'Left' | 'Right' | 'Top' | 'Bottom';
//export type TNodeId = string | number;

export interface UiNode {
	id: string | number;
	type: UiNodeType;
	label: string;
}

export interface UiBasicNode extends UiNode {
	shape: string;
}

export interface UiConnector {
	id: string;
	parentId: string;
	/** The connector position. If the value is 'Point', the reference point (0,0) is located in the top-right corner of the node. */
	position: Point | 'Left' | 'Right' | 'Top' | 'Bottom';
	/** The angle that the connector has to  */
	normalDirection?: number;
}

export interface UiSvgSymbolNode extends UiNode {
	svgDataUri: string;
	connectors: UiConnector[];
	width: number;
	height: number;
}

export interface IUiPatchHandler {
	addNode(node: UiNode): void;
	removeNode(nodeId: string | number): void;
	addNodeConnector(connector: UiConnector): void;
	// removeNodePort(): void;
	// addConnection(): void;
	// removeConnection(): void;
	onBeforeApplyPatch?: () => void;
	onAfterApplyPatch?: () => void;
}

export type UiNegotiatorOptions = {};

const UiNegotiatorDefaultOptions = {} as const;

/** Translates a graph patch to UI commands */
export class UiNegotiator {
	constructor(readonly ui: IUiPatchHandler, readonly options: UiNegotiatorOptions = UiNegotiatorDefaultOptions) {}
	applyPatch(graphPatch: GraphPatch): void {
		this.ui.onBeforeApplyPatch?.call(this.ui);
		for (const graphAssertion of graphPatch) {
			//console.log('applying patch', i++);
			switch (graphAssertion.action) {
				case 'add':
					switch (graphAssertion.assertion.type) {
						case 'node':
							this.ui.addNode({
								id: graphAssertion.assertion.id + '_UiNegotiator',
								type: 'BasicShape',
								label: graphAssertion.assertion.id + '_UiNegotiator',
							});

							//addNode(model, patch.assertion);
							break;
						// case "connector":
						// 	break;
						case 'link':
							this.ui.addNode({
								id: graphAssertion.assertion.id + '_UiNegotiator',
								type: 'BasicShape',
								label: graphAssertion.assertion.id + '_UiNegotiator',
							});
							this.ui.addNode({
								id: graphAssertion.assertion.id + '_UiNegotiator',
								type: 'BasicShape',
								label: graphAssertion.assertion.id + '_UiNegotiator',
							});
							// if (patch.assertion.linkRef?.id !== hasConnectorIri) {
							// 	debugger;
							// }
							break;
						case 'linkNode':
							if (graphAssertion.assertion.id === hasConnectorIri) break;
							// this.ui.addNodeConnector({
							// 	id: '',
							// 	parentId: '',
							// 	position: 'Top',
							// });
							break;
						case 'property':
							//addProperty(model, patch.assertion);
							//d.model.setDataProperty(a.node, a.key, a.value);
							break;
						default:
							break;
					}
					break;
				case 'remove':
					switch (graphAssertion.assertion.type) {
						case 'node':
							this.ui.removeNode(graphAssertion.assertion.id);
							break;

						default:
							break;
					}
					break;
			}
		}

		this.ui.onAfterApplyPatch?.call(this.ui);
	}

	// PRIVATE FUNCTIONS
}
