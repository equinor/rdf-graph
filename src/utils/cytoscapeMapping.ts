import { ElementDefinition } from 'cytoscape';
import { nanoid } from 'nanoid';

import { useNodeHelpers } from '../mapper';
import { RdfTriple } from '../models';
import { onlyUnique } from './onlyUnique';
import { short } from './short';

export const useMappers = () => {
	const [, uri2Node] = useNodeHelpers();

	const edges2ElementDefinitions = (edges: RdfTriple[]): ElementDefinition[] => {
		const cytoscapeEdges = edges.map(edge2CytoscapeEdge);
		return cytoscapeEdges2CytoscapeNodes(cytoscapeEdges).concat(cytoscapeEdges);
	};

	const cytoscapeEdgeId2Edge = (edgeElement: ElementDefinition): RdfTriple => {
		return new RdfTriple(edgeElement.data.source, edgeElement.data.predicate, edgeElement.data.target);
	};

	const cytoscapeEdges2CytoscapeNodes = (cytoscapeEdges: ElementDefinition[]): ElementDefinition[] => {
		return cytoscapeEdges
			.flatMap((e) => [e.data.target, e.data.source])
			.filter(onlyUnique)
			.map(uri2Node);
	};

	const edge2CytoscapeEdge = (triple: RdfTriple): ElementDefinition => {
		return {
			data: {
				id: nanoid(),
				source: triple.rdfSubject,
				target: triple.rdfObject,
				predicate: triple.rdfPredicate,
				label: short(triple.rdfPredicate),
			},
		};
	};

	return [edges2ElementDefinitions, cytoscapeEdgeId2Edge] as const;
};
