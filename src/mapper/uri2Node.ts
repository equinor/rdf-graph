import { ElementDefinition } from 'cytoscape';

import { short } from '../utils';

export const useNodeHelpers = () => {
	const createNode = (url: string, label?: string, image?: string, parentId?: string): ElementDefinition => {
		return {
			data: {
				id: url,
				label: label || short(url),
				image: image,
				parent: parentId,
			},
		};
	};

	const uri2Node = (url: string): ElementDefinition => {
		return {
			data: {
				id: url,
				label: short(url),
			},
		};
	};

	return [createNode, uri2Node] as const;
};
