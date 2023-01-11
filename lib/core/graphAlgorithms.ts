import { GraphEdge, GraphElement, GraphPatch, GraphState } from './types/core';
import { GraphSelection } from './types/ui';

export function bfs(
	selection: GraphSelection,
	state: GraphState,
	onElementMarked: (element: GraphElement) => GraphPatch[],
	onFinished?: (elementIris: string[]) => GraphPatch[]
) {
	const effect: GraphPatch[] = [];
	const visitedNodes = new Set<string>(selection.nodes);
	const visitedEdges = new Set<string>(selection.edges);
	const stack = [...visitedNodes, ...visitedEdges];

	const emptyIndex = Object.keys(state.nodeStore).reduce<Record<string, GraphEdge[]>>(
		(acc, current) => {
			acc[current] = [];
			return acc;
		},
		{}
	);

	const outgoing = Object.keys(state.edgeStore)
		.map((key) => state.edgeStore[key])
		.reduce<Record<string, GraphEdge[]>>((acc, current) => {
			acc[current.sourceId] = acc[current.sourceId].concat([current]);
			return acc;
		}, emptyIndex);

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
				if (visitedEdges.has(edge.id)) continue;
				visitedEdges.add(edge.id);
				stack.push(edge.id);
			}
		}

		if (currentElement?.type === 'edge') {
			if (visitedNodes.has(currentElement.targetId)) continue;
			visitedNodes.add(currentElement.targetId);
			stack.push(currentElement.targetId);
		}
	}

	if (onFinished) {
		console.log('Visited: ', visitedNodes);
		effect.push(...onFinished(Array.from(visitedNodes)));
	}

	return effect;
}
