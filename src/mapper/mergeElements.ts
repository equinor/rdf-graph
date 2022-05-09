import { ElementDefinition } from 'cytoscape';

export const mergeElementsById = (elements: ElementDefinition[]) => {
	const groupedById = elements.reduce((acc, element) => {
		const index = element.data.id!;
		if (!acc[index]) {
			acc[index] = [];
		}
		acc[index].push(element);
		return acc;
	}, {} as { [key: string]: ElementDefinition[] });

	return Object.keys(groupedById).map((key) => groupedById[key].reduce((acc, current) => mergeElements(acc, current)));
};

export const mergeElements = (first: ElementDefinition, second: ElementDefinition) => {
	return { ...first, ...second, data: { ...first.data, ...second.data } };
};
