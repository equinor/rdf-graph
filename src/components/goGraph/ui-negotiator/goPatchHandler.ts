import { createDefaultNodeData } from '../node-data-factory/default-node-factory';
import { IUiPatchHandler, UiConnector, UiNode } from './uiNegotiator';

export class GoJsPatchHandler implements IUiPatchHandler {
	constructor(readonly diagram: go.Diagram) {}

	// Interface implementation

	addNode(node: UiNode): void {
		this.diagram.model.addNodeData(createDefaultNodeData(node.id as string, node.label ?? node.id));
	}

	removeNode(nodeId: string): void {
		const nodeData = this.getNodeData(nodeId);
		if (!nodeData) return;
		this.diagram.model.removeNodeData(nodeData);
	}

	addNodeConnector(connector: UiConnector): void {
		throw new Error('Method not implemented.');
	}

	onBeforeApplyPatch() {
		this.diagram.startTransaction(this.getTransactionName());
		debugger;
	}

	onAfterApplyPatch() {
		this.diagram.commitTransaction(this.getTransactionName());
	}

	// Private functions

	private getNodeData(id: go.Key) {
		return this.diagram.model.findNodeDataForKey(id);
	}

	private getTransactionName(): string {
		return 'Apply patch';
	}
}
