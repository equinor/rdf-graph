import { ElementDefinition } from 'cytoscape';
import { RdfNodeDefinition } from '../models/cytoscapeExtensions.types';
import { postTransformations } from './postTransformations';

export const postProcessElements = (elements: ElementDefinition[]) => {
	const nodes = elements.filter((e) => !e.data.source).map((n) => n as RdfNodeDefinition);

	return postTransformations.flatMap((postTransformation) =>
		nodes.filter((n) => postTransformation.isApplicable(n)).flatMap((n) => postTransformation.transformNew(n, nodes))
	);
};

export const postUpdateElements = (newElements: ElementDefinition[], cy: cytoscape.Core) => {
	const newNodes = newElements.filter((e) => !e.data.source).map((n) => n as RdfNodeDefinition);

	return postTransformations.flatMap((postTransformation) =>
		newNodes.filter((n) => postTransformation.isApplicable(n)).flatMap((n) => postTransformation.transformUpdate(n, newNodes, cy))
	);
};
