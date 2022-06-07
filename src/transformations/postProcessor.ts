import { ElementDefinition } from 'cytoscape';
import { RdfNodeDefinition } from '../models/cytoscapeApi.types';
import deepMerge from '../utils/deepMerge';
import { postTransformations } from './svgPostTransformation';

export const postProcessElements = (elements: ElementDefinition[]) => {
	const nodes = elements.filter((e) => !e.data.source).map((n) => n as RdfNodeDefinition);

	return postTransformations.flatMap((postTransformation) =>
		nodes.filter((n) => postTransformation.isApplicable(n)).flatMap((n) => postTransformation.transformNew(n, nodes))
	);
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
