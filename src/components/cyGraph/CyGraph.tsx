import { layoutDagre } from '../../utils';
import Cytoscape, { ElementDefinition } from 'cytoscape';
import { useEffect, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { NodeType } from '../../models/nodeType';
import { hasConnectorIri, imageHeightKey, imageKey, imageWidthKey } from '../../mapper/predicates';
import { colorKey, labelKey, simpleSvgKey, labelIri } from '../../mapper/predicates';
import { GraphProps } from '../../state/GraphStateProps';
import { AbstractNode, GraphAssertion, GraphEdge, GraphPatch, GraphProperty } from '../../models/graphModel';
import { NodeSymbol } from '../../symbol-api';
import cytoscape from 'cytoscape';

const addNode = ({ id, type, node }: AbstractNode, cy: Cytoscape.Core) => {
	const elem: ElementDefinition = { data: { id } };

	if (type === 'metadata') {
		if (!elem.style) elem.style = {};
		elem.style.display = 'none';
		return;
	}
	if (type === 'connector') {
		elem.data.parent = node.id;
	}
	cy.add(elem);
};

const addProperty = ({ key, node, value }: GraphProperty, cy: Cytoscape.Core) => {
	const nodeById = cy.getElementById(node.id);

	switch (key) {
		case 'symbol':
			nodeById.data(nodeTypeKey, NodeType.SymbolContainer);
			nodeById.data(key, value);
			break;
		case 'relativePosition':
			nodeById.data(nodeTypeKey, NodeType.SymbolConnector);
			nodeById.data(key, value);
			break;
		case 'parent':
			nodeById.move({ parent: (node as any).parent!.id });
			break;
		default:
			nodeById.data(key, value);
	}
};

const addEdge = ({ id, source, sourceConnector, target, targetConnector, metadata }: GraphEdge, cy: Cytoscape.Core) => {
	const { [labelIri]: label } = metadata! || {};
	const elem: ElementDefinition = { data: { id, source: sourceConnector || source, target: targetConnector || target, [labelKey]: label } };
	cy.add(elem);
	return [];
};
const removeElement = ({ id }: GraphEdge | AbstractNode, cy: Cytoscape.Core) => {
	cy.remove(cy.getElementById(id));
};
const removeProperty = ({ key, node }: GraphProperty, cy: Cytoscape.Core) => {
	const element = cy.getElementById(node.id);
	element.removeData(key);
	if (key in ['symbol', 'relativePosition']) {
		element.removeData(nodeTypeKey);
	}
};

const getImageNodeId = (compoundNodeId: string) => `${compoundNodeId.replace('#', 'HASH')}_svg`;

const createImageNode = (nodeId: string, symbol: NodeSymbol, cy: Cytoscape.Core) => {
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
	cy.remove(`[id = "${getImageNodeId(compoundNodeId)}"]`);
};

const nodeTypeKey = 'nodeType';
const layoutIgnoreKey = 'layoutIgnore';

const applyPatch = (graphPatch: GraphPatch, cy: Cytoscape.Core) => {
	const postprocess: (() => void)[] = [];

	for (const { action, assertion } of graphPatch) {
		switch (action) {
			case 'add':
				switch (assertion.type) {
					case 'node':
					case 'connector':
						addNode(assertion, cy);
						break;
					case 'property':
						addProperty(assertion, cy);
						if (assertion.key === 'symbol') {
							createImageNode(assertion.node.id, (assertion.node as any).symbol!, cy);
						}

						break;
					case 'edge':
						if (assertion.metadata.id !== hasConnectorIri) {
							postprocess.push(...addEdge(assertion, cy));
						}
						break;
				}
				break;
			case 'remove':
				switch (assertion.type) {
					case 'edge':
					case 'connector':
					case 'node':
						removeElement(assertion, cy);
						break;
					case 'property':
						removeProperty(assertion, cy);
						if (assertion.key === 'symbol') {
							removeImageNode(assertion.node.id, cy);
						}
						break;
				}
				break;
		}
	}
};

const layoutHandler = (_event: cytoscape.EventObject) => {
	const connectorSelector = `[nodeType = "${NodeType.SymbolConnector}"]`;
	const imageSelector = `[nodeType = "${NodeType.SymbolImage}"]`;

	_event.cy
		.$(`${connectorSelector}, ${imageSelector}`)
		.layout({
			name: 'preset',
			animate: false,
			transform: (node) => {
				const parentPosition = node.parent().first().position();
				const relativePosition = node.data('relativePosition') || { x: 0, y: 0 };
				const position = { x: parentPosition.x + relativePosition.x, y: parentPosition.y + relativePosition.y };
				return position;
			},
		})
		.run();
};

export const CyGraph = ({ graphState, graphPatch, selectionEffect: onElementsSelected }: GraphProps) => {
	const selectedLayout = layoutDagre;

	const [nullableCy, setCy] = useState<Cytoscape.Core>();
	const patches = useRef<GraphAssertion[]>([]);

	const runLayout = (cy: cytoscape.Core) => {
		const layout = cy.layout(selectedLayout);
		layout.on('layoutstop', layoutHandler);
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

			cy.on('select', () => {
				const selection = cy.$('node:selected').map((n) => graphState.nodeIndex.get(n.data().id) as AbstractNode);
				onElementsSelected(selection);
			});

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
