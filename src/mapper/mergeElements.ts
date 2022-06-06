import { ElementDefinition } from 'cytoscape';
import { RdfNodeDataDefinition } from '../models/cytoscapeExtensions.types';
import deepMerge from '../utils/deepMerge';

export const groupElementsByKey = (elements: ElementDefinition[], key: string) => {
	return elements.reduce((acc, element) => {
		const index = element.data[key];
		if (index !== undefined) {
			if (!acc[index]) {
				acc[index] = [];
			}
			acc[index].push(element);
		}
		return acc;
	}, {} as { [key: string]: ElementDefinition[] });
};

export const mergeElementsByKey = (elements: ElementDefinition[], key = 'id') => {
	const groupedById = groupElementsByKey(elements, key);
	return Object.keys(groupedById).map((key) => groupedById[key].reduce((acc, current) => mergeElements(acc, current)));
};

export const mergeElements = (first: ElementDefinition, second: ElementDefinition): ElementDefinition => {
	const merged = deepMerge(first, second);
	return merged;
};

export const mergeData = (first: RdfNodeDataDefinition, second: RdfNodeDataDefinition): RdfNodeDataDefinition => {
	const merged = deepMerge(first, second);
	return merged;
};
