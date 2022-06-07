import cytoscape, { ElementDefinition } from 'cytoscape';
import { TurtleGraphError } from '../components/sparqlGraph/SparqlGraph.types';
import { getChildren, getData, getDataFromElement } from '../cytoscape-api/cytoscapeApi';
import { RdfNodeDataDefinition, RdfNodeDefinition } from '../cytoscape-api/cytoscapeApi.types';
import { NodeType } from '../models/nodeType';
import { getSymbol, SymbolRotation } from '../symbol-api';
import deepMerge from '../utils/deepMerge';
import { setEquals } from '../utils/setEquals';
import { mergeElementsByKey } from '../mapper/mergeElements';
import { hasConnectorPredicate, hasConnectorSuffixPredicate, hasSvgPredicate, rotationPredicate } from '../mapper/predicates';
import { PostTransformation } from './postTransformations.types';
import { createSymbol, createSymbolNode, createSymbolNodeId, getPosition } from './svgHelpers';

const createConnectorTransformation = (): PostTransformation => {
	const isApplicable = (e: RdfNodeDefinition) => !!getDataFromElement(e, hasConnectorSuffixPredicate.value);

	const transformNew = (element: RdfNodeDefinition, others: RdfNodeDefinition[]) => {
		const mainElement = others.find((n) => getChildren(n, hasConnectorPredicate.value).includes(element.data.id!))!;

		const rotation = parseInt(getDataFromElement(mainElement, rotationPredicate.value) ?? '0') as SymbolRotation;
		const symbol = getSymbol(getDataFromElement(mainElement, hasSvgPredicate.value)!, { rotation: rotation });

		const connectorNode: RdfNodeDefinition = {
			data: {
				...element.data,
				parent: mainElement.data.id!,
				layoutIgnore: true,
				nodeType: NodeType.SymbolConnector,
			},
			position: symbol.connectors.find((c) => c.id === getDataFromElement(element, hasConnectorSuffixPredicate.value))!.point,
			grabbable: false,
		};
		return [connectorNode];
	};

	const transformUpdate = (_newElement: RdfNodeDefinition, _others: RdfNodeDefinition[], _cy: cytoscape.Core) => {};

	return { isApplicable, transformNew, transformUpdate };
};

const createSvgTransformation = (): PostTransformation => {
	const isApplicable = (e: RdfNodeDefinition) => !!getDataFromElement(e, hasSvgPredicate.value) || !!getDataFromElement(e, rotationPredicate.value);

	const transformNew = (element: RdfNodeDefinition, _others: RdfNodeDefinition[]) => {
		const mainElement = element as RdfNodeDefinition;
		const symbol = createSymbol(mainElement.data);

		const parentNode: ElementDefinition = {
			data: {
				...element.data,
				imageHeight: `${symbol.height}px`,
				imageWidth: `${symbol.width}px`,
				nodeType: NodeType.SymbolContainer,
			},
		};

		return [parentNode, createSymbolNode(element.data.id!, symbol, { x: 0, y: 0 })];
	};

	const transformUpdate = (newElement: RdfNodeDefinition, others: RdfNodeDefinition[], cy: cytoscape.Core) => {
		const id = newElement.data.id!;
		const oldElement = cy.elements(`[id = "${id}"]`)[0];

		const oldSymbolNode = cy.elements(`[id = "${createSymbolNodeId(id)}"]`)[0];
		const oldConnectors = oldElement?.children(`[nodeType = "${NodeType.SymbolConnector}"]`);

		const oldConnectorElements = oldConnectors.map((c) => {
			return { data: c.data() } as RdfNodeDefinition;
		});

		const newConnectorIds = getChildren(newElement, hasConnectorPredicate.value);
		const newConnectors = others.filter((o) => newConnectorIds.includes(o.data.id!));

		const combinedData = deepMerge(oldElement.data(), newElement.data) as RdfNodeDataDefinition;
		if (!getData(combinedData, hasSvgPredicate.value)) {
			return;
		}

		const elementConnectors = mergeElementsByKey(oldConnectorElements.concat(newConnectors));
		const elementConnectorIds = elementConnectors.map((c) => getDataFromElement(c as RdfNodeDefinition, hasConnectorSuffixPredicate.value));

		const symbol = createSymbol(combinedData);
		const symbolConnectorIds = symbol.connectors.map((c) => c.id);

		if (!setEquals(elementConnectorIds, symbolConnectorIds)) {
			throw new TurtleGraphError(
				`Unable to match connectors from ${id}[${elementConnectorIds.join(', ')}] with connectors from symbol ${
					symbol.id
				}[${symbolConnectorIds.join(', ')}]`
			);
		}

		const position = oldElement ? oldElement.position() : { x: 0, y: 0 };

		if (oldSymbolNode) {
			oldSymbolNode.data('image', symbol.svgDataURI());
			oldSymbolNode.data('imageHeight', `${symbol.height}px`);
			oldSymbolNode.data('imageWidth', `${symbol.width}px`);
		} else {
			const newSymbolNode = createSymbolNode(id, symbol, position);
			cy.add(newSymbolNode);
		}

		for (let i = 0; i < newConnectors.length; i++) {
			cy.add({
				data: {
					...newConnectors[i].data,
					parent: id,
					layoutIgnore: true,
					nodeType: NodeType.SymbolConnector,
				},
				position: getPosition(symbol, position, getDataFromElement(newConnectors[i], hasConnectorSuffixPredicate.value)!),
				grabbable: false,
			});
		}

		for (let i = 0; i < oldConnectors.length; i++) {
			const p = getPosition(symbol, position, getDataFromElement(oldConnectorElements[i], hasConnectorSuffixPredicate.value)!);
			oldConnectors[i].position('x', p.x);
			oldConnectors[i].position('y', p.y);
		}

		oldElement.data('imageHeight', `${symbol.height}px`);
		oldElement.data('imageWidth', `${symbol.width}px`);
		oldElement.data('nodeType', NodeType.SymbolContainer);
	};
	return { isApplicable, transformNew, transformUpdate };
};

export const postTransformations: PostTransformation[] = [createConnectorTransformation(), createSvgTransformation()];
