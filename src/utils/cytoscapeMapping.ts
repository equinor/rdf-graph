import { ElementDefinition } from 'cytoscape';
import { nanoid } from 'nanoid';
import { rdfObjectKey, rdfPredicateKey, rdfSubjectKey } from '../components/sparqlGraph/cytoscapeDataKeys';

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
		return new RdfTriple(edgeElement.data[rdfSubjectKey], edgeElement.data[rdfPredicateKey], edgeElement.data[rdfObjectKey]);
	};

	const cytoscapeEdges2CytoscapeNodes = (cytoscapeEdges: ElementDefinition[]): ElementDefinition[] => {
		return cytoscapeEdges
			.flatMap((e) => [e.data[rdfSubjectKey], e.data[rdfObjectKey]])
			.filter(onlyUnique)
			.map(uri2Node);
	};

	const edge2CytoscapeEdge = (triple: RdfTriple): ElementDefinition => {
		let edgeElement: ElementDefinition = {
			data: {
				source: triple.rdfSubject,
				target: triple.rdfObject,
				id: nanoid(),
				label: short(triple.rdfPredicate),
			},
		};

		edgeElement.data[rdfSubjectKey] = triple.rdfSubject;
		edgeElement.data[rdfPredicateKey] = triple.rdfPredicate;
		edgeElement.data[rdfObjectKey] = triple.rdfObject;

		return edgeElement;
	};

	return [edges2ElementDefinitions, cytoscapeEdgeId2Edge] as const;
};
