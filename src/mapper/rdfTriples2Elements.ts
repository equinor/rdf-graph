import { Quad } from 'n3';
import { mergeElementsByKey } from './mergeElements';
import { edgeTransformation, dataTransform, hasChildrenTransform, parentTransform } from './transformations';

export const rdfTriples2Elements = (quads: Quad[]) => {
	const transformations = [edgeTransformation, dataTransform, hasChildrenTransform, parentTransform];

	const elements = transformations.flatMap((transform) => quads.flatMap((q) => transform(q)));

	return mergeElementsByKey(elements);
};
