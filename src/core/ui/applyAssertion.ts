import { GraphAssertion } from '../types';
import {
	IUiPatchHandler,
	UiNodePatchProperties,
	UiConnectorPatchProperties,
	UiEdgePatchProperties,
} from './applyPatch';

export function applyAssertion(ui: IUiPatchHandler, { action, assertion }: GraphAssertion) {
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
					if (action === 'add')
						ui.addNodeProperty(
							assertion.target.id,
							assertion.key as keyof UiNodePatchProperties,
							assertion.value
						);
					else
						ui.removeNodeProperty(
							assertion.target.id,
							assertion.key as keyof UiNodePatchProperties
						);
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
					if (action === 'add')
						ui.addEdgeProperty(
							assertion.target.id,
							assertion.key as keyof UiEdgePatchProperties,
							assertion.value
						);
					else
						ui.removeEdgeProperty(
							assertion.target.id,
							assertion.key as keyof UiEdgePatchProperties
						);
					break;
				default:
					break;
			}
			break;
		default:
			break;
	}
}
