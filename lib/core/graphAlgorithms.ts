import { GraphEdge, GraphElement, GraphPatch, GraphState } from './types/core';
import { GraphSelection } from './types/ui';

export function bfs(
	selection: GraphSelection,
	state: GraphState,
	onElementMarked: (element: GraphElement) => GraphPatch[]
) {
	const effect: GraphPatch[] = [];
	const visited = new Set<string>(selection.nodes.concat(selection.edges));
	const stack = [...visited];

	const outgoing = Object.keys(state.edgeStore)
		.map((key) => state.edgeStore[key])
		.reduce<Record<string, GraphEdge[]>>((acc, current) => {
			acc[current.sourceId] =
				current.sourceId in acc ? acc[current.sourceId].concat([current]) : [current];
			return acc;
		}, {});

	while (stack.length > 0) {
		const currentId = stack.pop();
		if (!currentId) break;

		let currentElement: GraphElement | undefined = undefined;
		if (currentId in state.nodeStore) {
			currentElement = state.nodeStore[currentId];
		} else if (currentId in state.edgeStore) {
			currentElement = state.edgeStore[currentId];
		}

		if (currentElement) {
			effect.push(...onElementMarked(currentElement));
		}

		if (currentElement?.type === 'node') {
			for (const edge of outgoing[currentId]) {
				if (visited.has(edge.id)) continue;
				visited.add(edge.id);
				stack.push(edge.id);
			}
		}

		if (currentElement?.type === 'edge') {
			if (visited.has(currentElement.targetId)) continue;
			visited.add(currentElement.targetId);
			stack.push(currentElement.targetId);
		}
	}

	return effect;
}
