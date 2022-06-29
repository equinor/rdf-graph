import { layoutCola, layoutDagre } from '../../utils';
import Cytoscape, { ElementDefinition } from 'cytoscape';
import { useEffect, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { NodeType } from '../../models/nodeType';
import { hasConnectorIri, imageHeightKey, imageKey, imageWidthKey, predicateMap, relativePositionXKey, svgKey } from '../../mapper/predicates';
import { colorKey, labelKey, simpleSvgKey, labelIri } from '../../mapper/predicates';
import { GraphStateProps } from '../state/GraphStateProps';
import {
	GraphAssertion,
	GraphEdge,
	GraphEdgeIdentifier,
	GraphNode,
	GraphNodeIdentifier,
	GraphPatch,
	GraphPropertyIdentifier,
} from '../../models/graphModel';
import { NodeSymbol } from '../../symbol-api';
import cytoscape from 'cytoscape';

const addNode = (n: GraphNodeIdentifier, cy: Cytoscape.Core) => {
	const { id, type } = n;
	const elem: ElementDefinition = { data: { id: id } };
	if (type === 'linkNode') {
		if (!elem.style) elem.style = {};
		elem.style.display = 'none';
	}
	cy.add(elem);
};

const addProperty = (prop: GraphPropertyIdentifier, cy: Cytoscape.Core) => {
	const node = cy.getElementById(prop.node.id);

	switch (prop.key) {
		case 'symbol':
			node.data(nodeTypeKey, NodeType.SymbolContainer);
			node.data(prop.key, prop.value);
			break;
		case 'relativePosition':
			//cy.remove(prop.node.id)

			//cy.add(createConnectorNode(node.id, newPosition, node.data('parent')));
			node.data(nodeTypeKey, NodeType.SymbolConnector);
			node.data(prop.key, prop.value);
			//node.data(layoutIgnoreKey, true);

			// const handler = (_event: cytoscape.EventObject) => {
			// 	const parent = cy.getElementById(prop.node.parent!.id);
			// 	const position = parent.position();
			// 	const newPosition = { x: position.x + prop.node.relativePosition!.x, y: position.y + prop.node.relativePosition!.y };
			// 	//node.position({x: -50, y: -50});
			// 	console.log("IN handler, newposition = ", newPosition)
			// 	const presetLayout = {name: 'preset', animate: false, transform: (t: cytoscape.NodeSingular) => {return newPosition}};
			// 	// cy.on('layoutready', cy.collection([node]), handler);
			// 	node.layout(presetLayout);
			// 	node.on('layoutready', handler);
			// };
			// cy.on('layoutready', handler), cy.collection([node]);

			break;
		case 'parent':
			node.move({ parent: prop.node.parent!.id });
			break;
		default:
			node.data(prop.key, prop.value);
	}
};

const addEdge = (n: GraphEdge, cy: Cytoscape.Core) => {
	const { id, source, target } = n;
	const { [labelIri]: label } = n.linkRef! || {};
	const elem: ElementDefinition = { data: { id: id, source: source, target: target, [labelKey]: label } };
	cy.add(elem);
	return [];
};
const removeElement = (element: GraphEdgeIdentifier | GraphNodeIdentifier, cy: Cytoscape.Core) => {
	cy.remove(cy.getElementById(element.id));
};
const removeProperty = (prop: GraphPropertyIdentifier, cy: Cytoscape.Core) => {
	if (!predicateMap.includes(prop.key)) return;
	const element = cy.getElementById(prop.node.id);
	element.removeData(prop.key);
	if (prop.key in ['symbol', 'relativePosition']) {
		element.removeData(nodeTypeKey);
	}
};

const getImageNodeId = (compoundNodeId: string) => `${compoundNodeId}_svg`;

const createConnectorNode = (nodeId: string, position: { x: string; y: string }, parent: string) => {
	return {
		data: {
			parent: parent,
			layoutIgnore: true,
			nodeType: NodeType.SymbolConnector,
		},
		position: position,
		grabbable: false,
	};
};

const createImageNode = (nodeId: string, symbol: NodeSymbol, cy: Cytoscape.Core) => {
	const position = cy.getElementById(nodeId).position();

	const imageElement: ElementDefinition = {
		data: {
			id: getImageNodeId(nodeId),
			[nodeTypeKey]: NodeType.SymbolImage,
			[imageKey]: symbol.svgDataURI(),
			[imageWidthKey]: symbol.width,
			[imageHeightKey]: symbol.height,
			[layoutIgnoreKey]: true,
			parent: nodeId,
		},
		position: { x: 0, y: 0 },
	};
	cy.add(imageElement);
};

const removeImageNode = (compoundNodeId: string, cy: Cytoscape.Core) => {
	const compound = cy.getElementById(compoundNodeId);
	cy.remove(getImageNodeId(compoundNodeId));
};

const nodeTypeKey = 'nodeType';
const layoutIgnoreKey = 'layoutIgnore';

const applyPatch = (graphPatch: GraphPatch, cy: Cytoscape.Core) => {
	const postprocess: (() => void)[] = [];

	for (const a of graphPatch) {
		switch (a.action) {
			case 'add':
				switch (a.assertion.type) {
					case 'node':
					case 'linkNode':
						addNode(a.assertion, cy);
						break;
					case 'property':
						addProperty(a.assertion, cy);
						if (a.assertion.key === 'symbol') {
							createImageNode(a.assertion.node.id, a.assertion.node.symbol!, cy);
						}

						break;
					case 'link':
						if (a.assertion.linkRef?.id !== hasConnectorIri) {
							postprocess.push(...addEdge(a.assertion, cy));
						}
						break;
				}
				break;
			case 'remove':
				switch (a.assertion.type) {
					case 'link':
					case 'linkNode':
					case 'node':
						removeElement(a.assertion, cy);
						break;
					case 'property':
						removeProperty(a.assertion, cy);
						if (a.assertion.key === 'symbol') {
							removeImageNode(a.assertion.node.id, cy);
						}
						break;
				}
				break;
		}
	}
};

const layouthandler = (_event: cytoscape.EventObject) => {
	console.log('EVENT OBJECT ', _event);
	const connectorSelector = `[nodeType = "${NodeType.SymbolConnector}"]`;
	const imageSelector = `[nodeType = "${NodeType.SymbolImage}"]`;

	_event.cy
		.$(`${connectorSelector}, ${imageSelector}`)
		.layout({
			name: 'preset',
			animate: false,
			transform: (node, pos) => {
				const parentPosition = node.parent().first().position();
				const relativePosition = node.data('relativePosition') || { x: 0, y: 0 };
				const position = { x: parentPosition.x + relativePosition.x, y: parentPosition.y + relativePosition.y };
				return position;
			},
		})
		.run();
};

export const CyGraph = ({ graphState, graphPatch /*, onElementsSelected, uiConfig */ }: GraphStateProps) => {
	const selectedLayout = layoutDagre;

	const [nullableCy, setCy] = useState<Cytoscape.Core>();
	const patches = useRef<GraphAssertion[]>([]);

	const runLayout = (cy: cytoscape.Core) => {
		const layout = cy.layout(selectedLayout);
		layout.on('layoutstop', layouthandler);
		layout.run();
	};

	useEffect(() => {
		if (!nullableCy) {
			patches.current.push(...graphPatch);
			return;
		}
		nullableCy.batch(() => {
			applyPatch(graphPatch, nullableCy);
		});

		runLayout(nullableCy);
	}, [graphPatch]);

	useEffect(() => {
		if (nullableCy) {
			const cy = nullableCy!;
			cy.batch(() => {
				applyPatch(patches.current, nullableCy);
				patches.current = [];
			});
			runLayout(nullableCy);
		}
	}, [nullableCy]);

	const setCytoscapeHandle = (cy: Cytoscape.Core) => {
		if (nullableCy) return; // Already initialized
		setCy(cy);
	};

	// const createSelector = (key: string, value: string) => {
	// 	return `[${key}='${value}']`;
	// };

	// const getAllNodes = (quads: Quad[]) =>
	// 	quads.map((q) => q.subject.value).concat(quads.filter((q) => q.object.termType === 'NamedNode').map((q) => q.object.value));

	// const applyPatch = (patch: RdfPatch) => {
	// 	if (!nullableCy) return;
	// 	const cy = nullableCy;
	// 	const newAdditions = rdfTriples2Elements(patch.tripleAdditions);

	// 	patch.tripleRemovals
	// 		.filter((q) => q.object.termType === 'NamedNode' && !isHierarchyPredicate(q.predicate.value))
	// 		.forEach((q) =>
	// 			cy.remove(
	// 				'edge' +
	// 					createSelector(rdfSubjectKey, q.subject.value) +
	// 					createSelector(rdfPredicateKey, q.predicate.value) +
	// 					createSelector(rdfObjectKey, q.object.value)
	// 			)
	// 		);

	// 	postUpdateElements(newAdditions, cy);
	// 	removeData(patch.tripleRemovals, cy);
	// 	const allNodes = getAllNodes(patch.tripleAdditions).concat(getAllNodes(patch.tripleRemovals)).filter(onlyUnique);
	// 	allNodes.forEach((node) => syncNodeData(node, cy));
	// 	deleteEmpty(allNodes, cy);
	// };

	// useEffect(() => {
	// 	if (nullableCy) {
	// 		const cy = nullableCy!;
	// 		cy.forceRender();
	// 	}
	// }, [state.forceRedraw]);

	// useEffect(() => {
	// 	const patch = patches.length > 0 && patches.at(-1);
	// 	patch && applyPatch(patch);
	// }, [patches]);

	// useEffect(() => {
	// 	if (nullableCy) {
	// 		const els = nullableCy.elements('[!layoutIgnore]');
	// 		els.layout(selectedLayout).run();
	// 	}
	// }, [selectedLayout]);

	return (
		<CytoscapeComponent
			elements={[]}
			style={{ height: '100vh', width: '100%' }}
			stylesheet={[
				{
					selector: `[nodeType = "${NodeType.SymbolContainer}"]`,
					style: {
						shape: 'rectangle',
						'background-color': 'red',
						'background-opacity': 0,
						'border-width': 0,
					},
				},
				{
					selector: `[nodeType = "${NodeType.SymbolImage}"]`,
					style: {
						shape: 'rectangle',
						'background-clip': 'none',
						'background-fit': 'contain',
						'background-image': `data(${imageKey})`,

						width: `data(${imageWidthKey})`,
						height: `data(${imageWidthKey})`,
						'background-color': 'blue',
						'background-opacity': 0,
						'border-width': 0,
						'padding-bottom': '0px',
						events: 'no',
					},
				},
				{
					selector: `[nodeType = "${NodeType.SymbolConnector}"]`,
					style: {
						shape: 'rectangle',
						// height: state.uiConfig.showConnectors ? '8px' : '1px',
						// width: state.uiConfig.showConnectors ? '8px' : '1px',
						height: '8px',
						width: '8px',
						'background-color': 'red',
						// 'background-opacity': state.uiConfig.showConnectors ? 0.7 : 0.0,
						'background-opacity': 0.7,
						'border-width': 0,
					},
				},
				{
					selector: ':selected',
					style: {
						'border-style': 'dashed',
						'border-color': 'blue',
						'border-width': 2,
					},
				},
				{
					selector: `[${colorKey}]`,
					style: {
						'background-color': `data(${colorKey})`,
					},
				},
				{
					selector: `[${labelKey}]`,
					style: {
						label: `data(${labelKey})`,
						'text-valign': 'bottom',
						'text-halign': 'center',
						'text-wrap': 'wrap',
						'text-max-width': '150px',
					},
				},
				{
					selector: `[${simpleSvgKey}]`,
					style: {
						'background-clip': 'none',
						'background-fit': 'contain',
						'background-opacity': 0,
						'border-width': 0,
						'padding-bottom': '0px',
						'background-image': `data(${simpleSvgKey})`,
					},
				},
				{
					selector: 'edge',
					style: {
						// 'curve-style': state.uiConfig.edgeStyle,
						'curve-style': 'bezier',
						width: '1px',
						color: 'black',
						'line-color': 'black',
						'target-arrow-color': '#ccc',
						'target-arrow-fill': 'filled',
						'target-arrow-shape': 'chevron',
						'arrow-scale': 1.5,
					},
				},
			]}
			// maxZoom={uiConfig.maxZoom}
			// minZoom={uiConfig.minZoom}
			// zoom={uiConfig.zoom}
			maxZoom={2}
			minZoom={0.4}
			zoom={1}
			// zoomingEnabled={uiConfig?.zoomingEnabled}
			zoomingEnabled={true}
			cy={(x) => setCytoscapeHandle(x)}
		/>
	);
};
