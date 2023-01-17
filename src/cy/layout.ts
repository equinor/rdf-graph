import Cytoscape from 'cytoscape';
import cola from 'cytoscape-cola';
import dagre from 'cytoscape-dagre';
import coseBilkent from 'cytoscape-cose-bilkent';

export const layoutDagre = {
	name: 'dagre',
	// dagre algo options, uses default value on undefined
	nodeSep: undefined, // the separation between adjacent nodes in the same rank
	edgeSep: undefined, // the separation between adjacent edges in the same rank
	rankSep: undefined, // the separation between each rank in the layout
	rankDir: undefined, // 'TB' for top to bottom flow, 'LR' for left to right,
	align: undefined, // alignment for rank nodes. Can be 'UL', 'UR', 'DL', or 'DR', where U = up, D = down, L = left, and R = right
	acyclicer: undefined, // If set to 'greedy', uses a greedy heuristic for finding a feedback arc set for a graph.
	// A feedback arc set is a set of edges that can be removed to make a graph acyclic.
	ranker: undefined, // Type of algorithm to assign a rank to each node in the input graph. Possible values: 'network-simplex', 'tight-tree' or 'longest-path'
	minLen: function () {
		return 1;
	}, // number of ranks to keep between the source and target of the edge
	edgeWeight: function () {
		return 1;
	}, // higher weight edges are generally made shorter and straighter than lower weight edges

	// general layout options
	fit: true, // whether to fit to viewport
	padding: 30, // fit padding
	spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
	nodeDimensionsIncludeLabels: true, // whether labels should be included in determining the space used by a node
	animate: false, // whether to transition the node positions
	animateFilter: function () {
		return true;
	}, // whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
	animationDuration: 500, // duration of animation in ms if enabled
	animationEasing: undefined, // easing of animation if enabled
	boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
	transform: function (node: any, pos: any) {
		return pos;
	}, // a function that applies a transform to the final node position
	// ready: function () {}, // on layoutready
	// stop: function () {}, // on layoutstop
};

export const layoutCola = {
	name: 'cola',
	nodeDimensionsIncludeLabels: true,
	fit: true,
	handleDisconnected: true,
	animate: true,
	avoidOverlap: true,
	infinite: false,
	unconstrIter: 1,
	userConstIter: 0,
	allConstIter: 1,
	flow: { axis: 'x', minSeparation: -130 },
	// nodeSpacing: function (node: any) {
	//   return 50;
	// },
	ready: (e: { cy: { fit: () => void; center: () => void } }) => {
		e.cy.fit();
		e.cy.center();
	},
};

export const layoutCoseBilKent = {
	name: 'cose-bilkent',
	nodeDimensionsIncludeLabels: true,
	fit: true,
	handleDisconnected: true,
	animate: true,
	avoidOverlap: true,
	infinite: false,
	unconstrIter: 1,
	userConstIter: 0,
	allConstIter: 1,
	// gravityCompound: 10,
	// gravityRangeCompound: 100,
	flow: { axis: 'x', minSeparation: -130 },
	// nodeSpacing: function (node: any) {
	//   return 50;
	// },
	ready: (e: { cy: { fit: () => void; center: () => void } }) => {
		e.cy.fit();
		e.cy.center();
	},
};

Cytoscape.use(cola);
Cytoscape.use(dagre);
Cytoscape.use(coseBilkent);
