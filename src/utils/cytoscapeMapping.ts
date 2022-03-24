import { ElementDefinition } from 'cytoscape';

import { useNodeHelpers } from '../mapper';
import { Edge, EdgeIdDelimiter } from '../models';
import { onlyUnique } from './onlyUnique';
import { short } from './short';

export const useMappers = () => {
	const [, uri2Node] = useNodeHelpers();

	const edges2ElementDefinitions = (edges: Edge[]): ElementDefinition[] => {
		const cytoscapeEdges = edges.map(edge2CytoscapeEdge);
		return cytoscapeEdges2CytoscapeNodes(cytoscapeEdges).concat(cytoscapeEdges);
	};

	const cytoscapeEdgeId2Edge = (cytoscapeEdgeId: string): Edge => {
		const parts = cytoscapeEdgeId.split(EdgeIdDelimiter);
		if (parts) {
			return new Edge(parts[0], parts[1], parts[2]);
		}
		throw new Error('Unable to parse cytoscape edge with id ' + cytoscapeEdgeId);
	};

	const cytoscapeEdges2CytoscapeNodes = (cytoscapeEdges: ElementDefinition[]): ElementDefinition[] => {
		return cytoscapeEdges
			.flatMap((e) => [e.data.target, e.data.source])
			.filter(onlyUnique)
			.map(uri2Node);
	};

	const edge2CytoscapeEdge = (edge: Edge): ElementDefinition => {
		return { data: { id: edge.id(), source: edge.from, target: edge.to, label: short(edge.type) } };
	};

	return [edges2ElementDefinitions, cytoscapeEdgeId2Edge] as const;
};
