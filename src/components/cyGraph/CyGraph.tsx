import { layoutCola, layoutCoseBilKent, layoutDagre } from '../../utils';
import Cytoscape, { ElementDefinition } from 'cytoscape';
import { useEffect, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { NodeType } from '../../models/nodeType';
import { DataFactory } from 'n3';
import { predicateMap } from '../../mapper/predicates';
import {
	colorKey,
	labelKey,
	simpleSvgKey,
	compoundNodeKey,
	connectorKey,
	svgKey,
	rotationKey,
	hasSvgIri,
	rotationIri,
	hasConnectorIri,
	hasConnectorSuffixIri,
	labelIri,
} from '../../mapper/predicates';
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
import { postProcessElements } from '../../mapper';
import { getSymbol, SymbolRotation } from '../../symbol-api';

type PatchCallback = (g: ElementDefinition, cy: Cytoscape.Core) => void;
const babySit: { [index: string]: { pre: PatchCallback; post: PatchCallback; remove: PatchCallback } } = {
	// [hasSvgIri]: (''),
	// [rotationIri]: '',
	[hasConnectorIri]: {
		pre: (g, cy) => {
			cy.getElementById(g.data.target as string).data(compoundNodeKey, g.data.id);
		},
		post: () => {},
		remove: (g, cy) => {
			cy.getElementById(g.data.target as string).removeData(compoundNodeKey);
		},
	},
	[hasSvgIri]: {
		pre: (g, cy) => {
			const element = cy.getElementById(g.data.id as string);
			const rotation = element.data('rotation');
			const symbol = rotation ? getSymbol(g.data.value, { rotation: rotation as SymbolRotation }) : getSymbol(g.data.value as string);
			element.data('symbolName', g.data.value);
			element.data('symbol', symbol);
		},
		post: (g, cy) => {},
		remove: () => {},
	},
	[rotationIri]: {
		pre: (g, cy) => {
			const element = cy.getElementById(g.data.id as string);
			element.data('rotation', g.data.value);
			const symbolName = element.data('symbolName');
			if (!symbolName) return;
			const symbol = getSymbol(symbolName, { rotation: g.data.value as SymbolRotation });
			element.data('symbol', symbol);
		},
		post: () => {},
		remove: () => {},
	},
	[hasConnectorSuffixIri]: {
		pre: (g, cy) => {
			cy.getElementById(g.data.id as string).data(connectorKey, g.data.value);
		},
		post: (g, cy) => {
			//TODO: Get and parse coordinates from that goddamned SVG
		},
		remove: () => {},
	},
};
function addNode(n: GraphNodeIdentifier, cy: Cytoscape.Core) {
	const { id, type } = n;
	const elem: ElementDefinition = { data: { id: id } };
	if (type === 'linkNode') {
		if (!elem.style) elem.style = {};
		elem.style.display = 'none';
	}
	cy.add(elem);
}
function addProperty(e: GraphPropertyIdentifier, cy: Cytoscape.Core) {
	if (!predicateMap.includes(e.key)) return;
	if (babySit.hasOwnProperty(e.key)) {
		const { pre, post } = babySit[e.key];
		pre(n, cy);
		return [() => post(n, cy)];
	}
	const { id, key, value } = e;
	const elem = cy.getElementById(id).data(predicateMap.get(key), value);
}

function addEdge(n: GraphEdge, cy: Cytoscape.Core) {
	const { id, source, target } = n;
	const linkTypeName = n.linkRef?.id || '';
	if (babySit.hasOwnProperty(linkTypeName)) {
		const { pre, post } = babySit[linkTypeName];

		pre({ data: n }, cy);
		return [() => post(elem, cy)];
	}
	const { [labelIri]: label } = n.linkRef! || {};
	const elem: ElementDefinition = { data: { id: id, source: source, target: target, [labelKey]: label } };
	cy.add(elem);
	return [];
}
function remove(n: GraphEdgeIdentifier | GraphNodeIdentifier, cy: Cytoscape.Core) {
	cy.remove(cy.getElementById(n.id));
}
function removeProperty(e: GraphPropertyIdentifier, cy: Cytoscape.Core) {
	if (!predicateMap.includes(e.key)) return;
	cy.getElementById(e.id).removeData(predicateMap.get(e.key));
}
function applyPatch(graphPatch: GraphPatch, nullableCy: Cytoscape.Core) {
	const postprocess: (() => void)[] = [];
	for (const a of graphPatch) {
		switch (a.action) {
			case 'add':
				switch (a.assertion.type) {
					case 'node':
					case 'linkNode':
						addNode(a.assertion, nullableCy);
						break;
					case 'property':
						addProperty(a.assertion, nullableCy);
						break;
					case 'link':
						postprocess.push(...addEdge(a.assertion, nullableCy));
						break;
				}
				break;
			case 'remove':
				switch (a.assertion.type) {
					case 'link':
					case 'linkNode':
					case 'node':
						remove(a.assertion, nullableCy);
						break;
					case 'property':
						removeProperty(a.assertion, nullableCy);
				}
				break;
		}
	}
	for (const p of postprocess) p();
}
export const CyGraph = ({ graphState, graphPatch /*, onElementsSelected, uiConfig */ }: GraphStateProps) => {
	// const { turtleString, layoutName, patches, uiConfig } = state;
	// const selectedLayout = layouts.find((lt) => lt.name === layoutName)!.layout;
	const selectedLayout = layoutDagre;
	// const [elements, setElements] = useState<ElementDefinition[]>([]);

	const [nullableCy, setCy] = useState<Cytoscape.Core>();
	const patches = useRef<GraphAssertion[]>([]);

	// const prepareCytoscapeElements = async () => {
	// 	const es = await turtle2Elements(turtleString);
	// 	const [rdfNodes, other] = partition((e) => isValidRdfNodeData(e.data), es);
	// 	const syncedElements: RdfNodeDefinition[] = rdfNodes.map((e) => {
	// 		return { data: getSyncedNodeData(e.data as RdfNodeDataDefinition) };
	// 	});
	// 	const postProcessed = postProcessElements(other.concat(syncedElements));
	// 	setElements(postProcessed);
	// };

	const initialize = (cy: Cytoscape.Core) => {
		// cy.on('select', () => {
		// 	onElementsSelected(
		// 		new GraphSelection(
		// 			cy.$('node:selected').map((n) => n.data()),
		// 			cy.$('edge:selected').map(createQuad)
		// 		)
		// 	);
		// });
		// cy.on('unselect', () => {
		// 	if (cy.$(':selected').length === 0) {
		// 		onElementsSelected(new GraphSelection([], []));
		// 	}
		// });
	};

	// const createQuad = (element: SingularElementArgument): Quad =>
	// 	new Quad(namedNode(element.data(rdfSubjectKey)), namedNode(element.data(rdfPredicateKey)), namedNode(element.data(rdfObjectKey)));

	// useEffect(() => {
	// 	prepareCytoscapeElements();
	// }, [turtleString, state.resetCounter]);

	useEffect(() => {
		if (!nullableCy) {
			patches.current.push(...graphPatch);
			return;
		}
		nullableCy.batch(() => {
			applyPatch(graphPatch, nullableCy);
		});
		nullableCy.ready(() => {
			nullableCy.elements('[!layoutIgnore]').layout(selectedLayout).run();
		});
	}, [graphPatch]);

	useEffect(() => {
		if (nullableCy) {
			const cy = nullableCy!;
			cy.batch(() => {
				applyPatch(patches.current, nullableCy);
				patches.current = [];
			});
			cy.ready(() => {
				cy.elements('[!layoutIgnore]').layout(selectedLayout).run();
			});
		}
	}, [nullableCy /*, elements*/]);

	const setCytoscapeHandle = (cy: Cytoscape.Core) => {
		if (nullableCy) return; // Already initialized
		initialize(cy);
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
						'background-image': 'data(image)',
						'background-height': 'data(imageHeight)',
						'background-width': 'data(imageWidth)',
						width: 'data(imageHeight)',
						height: 'data(imageHeight)',
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
