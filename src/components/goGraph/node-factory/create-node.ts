import { GraphEdge, GraphNode, GraphPropertyIdentifier } from '../../../models';

export function createNode(a: GraphEdge | GraphNode | GraphPropertyIdentifier) {
	if (a.type !== 'node') throw new Error('');
}
