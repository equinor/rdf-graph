import cytoscape, { ElementDefinition, Position } from 'cytoscape';
import { TurtleGraphError } from '../components/sparqlGraph/SparqlGraph.types';
import { getChildren, getData, getParents } from '../models/cytoscapeElement';
import { RdfNodeDefinition } from '../models/cytoscapeExtensions.types';
import { NodeType } from '../models/nodeType';
import { getSymbol, NodeSymbol, SymbolRotation } from '../symbol-api';
import { setEquals } from '../utils/setEquals';
import { mergeElementsByKey } from './mergeElements';
import { hasConnectorPredicate, hasConnectorSuffixPredicate, hasSvgPredicate, rotationPredicate } from './predicates';

export type PostTransformation = {
	isApplicable: (e: RdfNodeDefinition) => boolean;
	transformNew: (element: RdfNodeDefinition, others: RdfNodeDefinition[]) => ElementDefinition[];
	transformUpdate: (element: RdfNodeDefinition, others: RdfNodeDefinition[], cy: cytoscape.Core) => void;
};

const createConnectorTransformation = (): PostTransformation => {
	const isApplicable = (e: RdfNodeDefinition) => !!getData(e, hasConnectorSuffixPredicate.value);

	const transformNew = (element: RdfNodeDefinition, others: RdfNodeDefinition[]) => {
		const mainElement = others.find((n) => getChildren(n, hasConnectorPredicate.value).includes(element.data.id!))!;

		const rotation = parseInt(getData(mainElement, rotationPredicate.value) ?? '0') as SymbolRotation;
		const symbol = getSymbol(getData(mainElement, hasSvgPredicate.value)!, { rotation: rotation });

		console.log('Trying to create connector data for ', element);
		const connectorNode: RdfNodeDefinition = {
			data: {
				...element.data,
				parent: mainElement.data.id!,
				layoutIgnore: true,
				nodeType: NodeType.SymbolConnector,
			},
			position: symbol.connectors.find((c) => c.id === getData(element, hasConnectorSuffixPredicate.value))!.point,
			grabbable: false,
		};

		console.log('Connector node ' + connectorNode);

		return [connectorNode];
	};

	const transformUpdate = (newElement: RdfNodeDefinition, others: RdfNodeDefinition[], cy: cytoscape.Core) => {};

	return { isApplicable, transformNew, transformUpdate };
};

const createSvgTransformation = (): PostTransformation => {
	const isApplicable = (e: RdfNodeDefinition) => !!getData(e, hasSvgPredicate.value);

	const transformNew = (element: RdfNodeDefinition, _others: RdfNodeDefinition[]) => {
		const mainElement = element as RdfNodeDefinition;
		const rotation = parseInt(getData(mainElement, rotationPredicate.value) ?? '0') as SymbolRotation;
		const symbol = getSymbol(getData(mainElement, hasSvgPredicate.value)!, { rotation: rotation });

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
		const oldElement = cy.getElementById(id);

		const oldSymbolNode = cy.getElementById(createSymbolNodeId(id));
		const oldConnectors = oldElement?.children(`[nodeType = "${NodeType.SymbolConnector}"]`);

		const oldConnectorElements = oldConnectors.map((c) => {
			return { data: c.data() };
		});

		const newConnectorIds = getChildren(newElement, hasConnectorPredicate.value);
		const newConnectors = others.filter((o) => newConnectorIds.includes(o.data.id!));

		const combinedData = Object.assign({}, oldElement.data(), newElement.data);

		const elementConnectors = mergeElementsByKey(oldConnectorElements.concat(newConnectors));

		const elementConnectorIds = elementConnectors.map((c) => c.data.connectorId);

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
				data: newConnectors[i].data,
				position: getPosition(symbol, position, newConnectors[i].data.connectorId),
				grabbable: false,
			});
		}

		for (let i = 0; i < oldConnectors.length; i++) {
			const p = getPosition(symbol, position, oldConnectors[i].data('connectorId'));
			oldConnectors[i].position('x', p.x);
			oldConnectors[i].position('y', p.y);
		}
	};
	return { isApplicable, transformNew, transformUpdate };
};

export const postTransformations: PostTransformation[] = [createConnectorTransformation(), createSvgTransformation()];
const getPosition = (symbol: NodeSymbol, parentPosition: Position, connectorId: string) => {
	const relativePosition = symbol.connectors.find((c) => c.id === connectorId)!.point;
	return {
		x: relativePosition!.x + parentPosition.x,
		y: relativePosition!.y + parentPosition.y,
	};
};

const createSymbolNode = (mainNodeId: string, symbol: NodeSymbol, position: Position): ElementDefinition => {
	return {
		data: {
			id: createSymbolNodeId(mainNodeId),
			parent: mainNodeId,
			nodeType: NodeType.SymbolImage,
			layoutIgnore: true,
			image: symbol.svgDataURI(),
			imageHeight: `${symbol.height}px`,
			imageWidth: `${symbol.width}px`,
		},
		position: position,
		grabbable: false,
		selectable: false,
	};
};

const createSymbolNodeId = (mainNodeId: string) => `${mainNodeId}-symbol`;

const createSymbol = (data: any): NodeSymbol => {
	const rotation = (parseInt(data.rotation) ?? 0) as SymbolRotation;
	return getSymbol(data.symbolId, { rotation: rotation });
};
