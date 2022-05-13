import { ElementDefinition } from 'cytoscape';
import { NodeType } from '../models/nodeType';
import { partition } from '../utils/partition';
import { groupElementsByKey } from './mergeElements';
import { createSvgTransformation } from './postTransformations';
import { postProcessSvgTag } from './transformations';

export const postProcessElements = (elements: ElementDefinition[]) => {
	const iconNode2Connectors = groupElementsByKey(
		elements.filter((e) => e.data.nodeType === NodeType.SymbolConnector),
		'parent'
	);
	const svgTransform = createSvgTransformation(iconNode2Connectors).transformNew;
	const [postProcess, noPostProcess] = partition((e) => e.data[postProcessSvgTag], elements);

	return noPostProcess.filter((e) => !e.data.ignore).concat(postProcess.flatMap((e) => svgTransform(e)));
};

export const postUpdateElements = (elements: ElementDefinition[], cy: cytoscape.Core) => {
	const iconNode2Connectors = groupElementsByKey(
		elements.filter((e) => e.data.nodeType === NodeType.SymbolConnector),
		'parent'
	);
	const svgTransform = createSvgTransformation(iconNode2Connectors).transformUpdate;

	elements.forEach((newElement) => {
		const oldElement = cy.elements(`[id = "${newElement.data.id}"]`)[0];
		if (oldElement) {
			Object.keys(newElement.data).forEach((key) => {
				oldElement.data(key, newElement.data[key]);
			});
			newElement.data.ignore = true;
		}
	});

	const [postProcess, noPostProcess] = partition((e) => e.data[postProcessSvgTag], elements);
	postProcess.forEach((e) => svgTransform(e, cy));
	noPostProcess.filter((e) => !e.data.ignore).forEach((e) => cy.add(e));
};
