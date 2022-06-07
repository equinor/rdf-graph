import { ElementDefinition } from 'cytoscape';
import { getNodesAndEdges } from '../models/cytoscapeApi';
import { RdfNodeDefinition } from '../models/cytoscapeApi.types';
import deepMerge from '../utils/deepMerge';
import { partition } from '../utils/partition';
import { postTransformations } from './svgPostTransformation';

export const postProcessElements = (elements: ElementDefinition[]) => {
	const { nodes, edges } = getNodesAndEdges(elements);

	return postTransformations
		.flatMap((postTransformation) => {
			const [applicable, notApplicable] = partition(postTransformation.isApplicable, nodes);

			return applicable.flatMap((n) => postTransformation.transformNew(n, nodes)).concat(notApplicable);
		})
		.concat(edges);
};

export const postUpdateElements = (additions: ElementDefinition[], cy: cytoscape.Core) => {
	const newElements: ElementDefinition[] = [];

	additions.forEach((addition) => {
		const oldElement = cy.elements(`[id = "${addition.data.id}"]`)[0];
		if (oldElement) {
			oldElement.data(deepMerge(oldElement.data(), addition.data));
		} else {
			newElements.push(addition);
		}
	});

	const nodeAdditions = additions.filter((e) => !e.data.source).map((n) => n as RdfNodeDefinition);

	postTransformations.forEach((postTransformation) =>
		nodeAdditions.filter((n) => postTransformation.isApplicable(n)).forEach((n) => postTransformation.transformUpdate(n, nodeAdditions, cy))
	);

	cy.add(newElements);
};
