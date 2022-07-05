import ReactDOMServer from 'react-dom/server';
import { GraphLinksModel, GraphObject, TextBlock, Binding, Diagram, Picture, Margin, Shape, Point, Panel, Spot, Node, Size, Link, Rect } from 'gojs';
import { ReactDiagram } from 'gojs-react';
import { Icon } from '@equinor/engineering-symbols';

// import svg from './images/ArrowRight.svg';

import { CustomLink } from './CustomLink';
import { GraphStateProps } from '../state/GraphStateProps';
import { useEffect, useRef, useState } from 'react';
import { GraphAssertion, GraphEdge, GraphNode, GraphPatch, GraphPropertyIdentifier } from '../../models/graphModel';
import { NodeSymbol } from '../../symbol-api/types/NodeSymbol';

const ll = <Icon appearance="dark" name="arrow-right" height={40} width={40} getPosition={(el) => console.log(123, el)} />;
const imsvg = ReactDOMServer.renderToString(ll);

const myImg = new Image();
// myImg.src = svg;
myImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(imsvg);

console.log(17, imsvg);

// const drawHandCanvas = () => {
// 	const canvas = document.createElement('canvas');
// 	const ctx = canvas.getContext('2d');
// 	// const img =  document.createElement('img');

// 	// console.log(191, ctx)

// 	// return ctx.drawImage(imsvg, 0, 0, 40, 40);
// 	// @ts-ignore
// 	// ctx.drawImage(imsvg, 0, 0, 40, 40);

// 	const img1 = new Image();
//   img1.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(imsvg);
//   ctx.drawImage(img1, 40, 40);

// 	return canvas
// }

// console.log(111, drawHandCanvas())

// console.log(81, 'myImg:', myImg, 'svg:', svg);

const nodeClicked = (e: any, obj: any) => {
	// executed by click and doubleclick handlers
	// console.log(100, obj.part.data)
	// console.log(1, obj.part.findTreeRoot().data);
	obj.part.findNodesConnected().each(function (n: any) {
		console.log(13, n.part.data);
	});
};

const makeImagePath = (icon: string) => {
	return `images/${icon}`;
};

const initDiagram = () => {
	const portSize = new Size(8, 8);

	const $ = GraphObject.make;
	// set your license key here before creating the diagram: go.Diagram.licenseKey = "...";
	const diagram = $(Diagram, {
		'undoManager.isEnabled': true, // must be set to allow for model change listening
		// 'undoManager.maxHistoryLength': 0,  // uncomment disable undo/redo functionality
		'clickCreatingTool.archetypeNodeData': { text: 'new node', color: 'lightblue' },
		model: new GraphLinksModel({
			linkKeyProperty: 'id', // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
			linkFromPortIdProperty: 'fromPort',
			linkToPortIdProperty: 'toPort',
			linkFromKeyProperty: 'source',
			linkToKeyProperty: 'target',
			nodeKeyProperty: 'id',
		}),
	});

	// define a simple Node template
	diagram.nodeTemplate = $(
		Node,
		'Table',
		{
			locationObjectName: 'BODY',
			locationSpot: Spot.Center,
			selectionObjectName: 'BODY',
			// contextMenu: nodeMenu
		},
		new Binding('location', 'loc', Point.parse).makeTwoWay(Point.stringify),

		// the body
		$(
			Panel,
			'Auto',
			{
				row: 1,
				column: 1,
				name: 'BODY',
				stretch: GraphObject.Fill,
				click: nodeClicked,
				doubleClick: nodeClicked,
			},
			$(
				Shape,
				// HERE: BG

				{
					fill: '#fff',
					stroke: '#dbf6cb',
					strokeWidth: 0,
					// measuredBounds: new Rect(20,20, 0, 0),
					// fromSpot: new go.Spot(0.5, 0.25), toSpot: new go.Spot(0.5, 0.75),
					// toSpot: go.Spot.Top,
					stretch: GraphObject.Fill,
					alignment: Spot.Center,
					minSize: new Size(20, 20),
					angle: 90,
				},
				new Binding('strokeWidth', 'shape', (s) => (s ? '1' : 0)),
				new Binding('fill', 'shape', (s) => {
					console.log('SSSHHHAAAAPPPPEEE', s);
					return s ? '#fff' : '#000';
				}),
				new Binding('stroke', 'shape', (s) => (s ? '#000' : '#fff')),
				new Binding('figure', 'shape')
				// new Binding('angle', 'angle')
				// new Binding('minSize', 'minSize', Spot.parse).makeTwoWay(Spot.stringify),
			),

			$(
				Picture,
				// { maxSize: new go.Size(50, 50) },
				// new go.Binding("source", "img")),
				// {
				// 	// source: 'images/sample.png',
				// 	// width: 48,
				// 	// height: 48,
				// 	// element: makeImage(),
				// 	// stroke: 'red',
				// 	// fill: 'blue',
				// 	// source: svg,
				// 	// element: drawHandCanvas(),
				// },
				// new Binding('element', 'icon', svg),
				new Binding('width', 'symbol', (w: NodeSymbol) => w.width),
				new Binding('height', 'symbol', (w: NodeSymbol) => w.height),
				new Binding('source', 'symbol', (w: NodeSymbol) => w.svgDataURI())
				// new Binding('element', 'symbolName')
				// new Binding('angle', 'angle')
				// <Icon appearance="main" name="arrow-right" height={50} width={50} getPosition={(el) => el} />
				// new Binding("sourceRect", "icon", makeImagePath)
			),
			$(
				TextBlock,
				{ margin: 10, textAlign: 'center', font: 'bold 14px Segoe UI,sans-serif', stroke: '#484848', editable: true },
				new Binding('text', 'name').makeTwoWay()
			)
		), // end Auto Panel body

		// the Panel holding the left port elements, which are themselves Panels,
		// created for each item in the itemArray, bound to data.leftArray
		$(Panel, 'Vertical', new Binding('itemArray', 'leftArray'), {
			row: 1,
			column: 0,
			itemTemplate: $(
				Panel,
				{
					_side: 'left', // internal property to make it easier to tell which side it's on
					fromSpot: Spot.Left,
					toSpot: Spot.Left,
					fromLinkable: true,
					toLinkable: true,
					cursor: 'pointer',
					// contextMenu: portMenu
				},
				new Binding('portId', 'portId'),
				$(
					Shape,
					'Rectangle',
					{
						stroke: null,
						strokeWidth: 0,
						desiredSize: portSize,
						margin: new Margin(1, 0),
					},
					new Binding('fill', 'portColor')
				)
			), // end itemTemplate
		}), // end Vertical Panel

		// the Panel holding the top port elements, which are themselves Panels,
		// created for each item in the itemArray, bound to data.topArray
		$(Panel, 'Horizontal', new Binding('itemArray', 'topArray'), {
			row: 0,
			column: 1,
			itemTemplate: $(
				Panel,
				{
					_side: 'top',
					alignment: new Spot(1, 1, 0, 0),
					fromSpot: Spot.Top,
					toSpot: Spot.Top,
					fromLinkable: true,
					toLinkable: true,
					cursor: 'pointer',
					// contextMenu: portMenu
				},
				new Binding('portId', 'portId')
				// $(go.Shape, "Rectangle",
				//   {
				//     stroke: null, strokeWidth: 0,
				//     desiredSize: portSize,
				//     margin: new go.Margin(0, 1)
				//   },
				//   new go.Binding("fill", portColor) )
			), // end itemTemplate
		}), // end Horizontal Panel

		// the Panel holding the right port elements, which are themselves Panels,
		// created for each item in the itemArray, bound to data.rightArray
		// console.log(18, new go.Binding("source", "alignment")),
		$(Panel, 'Vertical', new Binding('itemArray', 'rightArray'), {
			row: 1,
			column: 2,
			itemTemplate: $(
				Panel,
				{
					_side: 'right',
					// HERE: edge position
					// 1 - ?
					// 2 - ?
					// 3 - X
					// 4 - Y
					// 0 <- center | width/2 <- left/right
					// alignment: new go.Spot(1, 1, 0, 24),
					alignment: new Spot(1, 1, 0, 5.51),
					fromSpot: Spot.Right,
					toSpot: Spot.Right,
					fromLinkable: true,
					toLinkable: true,
					cursor: 'pointer',
					// stroke: "black",
					// contextMenu: portMenu
				},
				new Binding('portId', 'portId')
				// new go.Binding("alignment", alg, makAlg),

				// HERE: Shape
				// $(go.Shape, "Diamond",
				//   {
				//     stroke: null, strokeWidth: 0,
				//     desiredSize: portSize,
				//     // alignment: go.Spot.TopRight,
				//     // position: new go.Point(0, 10),
				//     // alignment: new go.Spot(0, 0.5),
				//     // spot1:  new go.Spot(1, 1, -5, 0),
				//     margin: new go.Margin(1, 0),
				//   },
				//   new go.Binding("fill", portColor) )
			), // end itemTemplate
		}), // end Vertical Panel

		// the Panel holding the bottom port elements, which are themselves Panels,
		// created for each item in the itemArray, bound to data.bottomArray
		$(Panel, 'Horizontal', new Binding('itemArray', 'bottomArray'), {
			row: 2,
			column: 1,
			itemTemplate: $(
				Panel,
				{
					_side: 'bottom',
					fromSpot: Spot.Bottom,
					toSpot: Spot.Bottom,
					fromLinkable: true,
					toLinkable: true,
					cursor: 'pointer',
					// contextMenu: portMenu
				},
				new Binding('portId', 'portId'),
				$(
					Shape,
					'Rectangle',
					{
						stroke: null,
						strokeWidth: 0,
						desiredSize: portSize,
						margin: new Margin(0, 1),
					},
					new Binding('fill', 'portColor')
				)
			), // end itemTemplate
		}) // end Horizontal Panel
	); // end Node

	diagram.linkTemplate = $(
		CustomLink, // defined below
		{
			routing: Link.AvoidsNodes,
			corner: 4,
			// HERE: link value
			curve: Link.JumpOver,
			// curve: go.Link.JumpGap,
			reshapable: true,
			resegmentable: true,
			relinkableFrom: true,
			relinkableTo: true,
		},
		new Binding('points').makeTwoWay(),
		$(Shape, {
			// HERE: edge color
			stroke: 'black',
			strokeWidth: 1,
		})
	);

	return diagram;
};
// posX & posY - original position (width/height) of connectors in original svg
const getX = (width: number, orgW: number, posX: number) => (width * posX) / orgW - width / 2;
const getY = (height: number, orgH: number, posY: number) => (height * posY) / orgH - height / 2;

const ArrowRight = (key: number, width: number, height: number, angle: number) => {
	// Original width & height of svg
	const orgH = 40;
	const orgW = 40;

	return {
		key,
		// icon: 'arrow-right',
		width,
		height,
		angle,
		topArray: [{ portId: 'top0', alignment: `1, 1, ${getX(width, orgW, 20)}, 0` }],
		rightArray: [{ portId: 'right1', alignment: `1, 1, 0, ${getY(height, orgH, 24.5)}` }],
		bottomArray: [],
		leftArray: [{ portId: 'left0' }],
	};
};
function addAssertion(d: Diagram, a: GraphEdge | GraphNode | GraphPropertyIdentifier) {
	switch (a.type) {
		case 'node':
			d.model.addNodeData(a);
			break;
		case 'link':
			(d.model as GraphLinksModel).addLinkData(a);
			break;
		case 'linkNode':
			break;
		case 'property':
			d.model.setDataProperty(a.node, a.key, a.value);
			break;
	}
}
export const GoGraphDZM = ({ graphState, graphPatch }: GraphStateProps) => {
	const [diagram, setDiagram] = useState<Diagram>();
	const patchBuffer = useRef<GraphAssertion[]>([]);

	function init() {
		const diagram = initDiagram();
		setDiagram(diagram);
		return diagram;
	}
	useEffect(() => {
		if (!diagram) return;
		applyPatch(diagram, patchBuffer.current);
		patchBuffer.current = [];
	}, [diagram]);

	useEffect(() => {
		if (!diagram) {
			patchBuffer.current.push(...graphPatch);
			return;
		}
		applyPatch(diagram, graphPatch);
	}, [graphPatch]);

	return (
		<>
			<ReactDiagram
				style={{ height: '1000px', width: '1000px' }}
				initDiagram={init}
				divClassName="graph-links-model"
				nodeDataArray={
					[
						// ArrowRight(1, 100, 100, 120),
						// {
						// 	key: 2,
						// 	icon: 'arrow-right',
						// 	width: 48,
						// 	height: 48,
						// 	leftArray: [
						// 		{
						// 			portId: 'left0',
						// 			alignment: '1 1 0 4.55',
						// 		},
						// 		{
						// 			portId: 'left1',
						// 			alignment: '1 1 0 4.55',
						// 		},
						// 		{
						// 			portId: 'left2',
						// 			alignment: '1 1 0 4.55',
						// 		},
						// 	],
						// 	topArray: [
						// 		{
						// 			portId: 'top0',
						// 		},
						// 	],
						// 	bottomArray: [
						// 		{
						// 			portId: 'bottom0',
						// 			alignment: '1 1 0 -18',
						// 		},
						// 		{
						// 			portId: 'bottom1',
						// 			alignment: '1 1 0 -18',
						// 		},
						// 		{
						// 			portId: 'bottom2',
						// 			alignment: '1 1 0 -18',
						// 		},
						// 	],
						// 	rightArray: [],
						// },
						// {
						// 	key: 3,
						// 	icon: 'arrow-right',
						// 	width: 48,
						// 	height: 48,
						// 	leftArray: [
						// 		{
						// 			portColor: '#66d6d1',
						// 			portId: 'left0',
						// 			alignment: '1 1 0 4.55',
						// 		},
						// 		{
						// 			portColor: '#fadfe5',
						// 			portId: 'left1',
						// 			alignment: '1 1 0 4.55',
						// 		},
						// 		{
						// 			portColor: '#6cafdb',
						// 			portId: 'left2',
						// 			alignment: '1 1 0 4.55',
						// 		},
						// 	],
						// 	topArray: [
						// 		{
						// 			portColor: '#66d6d1',
						// 			portId: 'top0',
						// 		},
						// 	],
						// 	bottomArray: [
						// 		{
						// 			portColor: '#6cafdb',
						// 			portId: 'bottom0',
						// 		},
						// 	],
						// 	rightArray: [],
						// 	group: 'Group1',
						// },
						// {
						// 	key: 4,
						// 	width: 48,
						// 	height: 48,
						// 	icon: 'arrow-right',
						// 	leftArray: [
						// 		{
						// 			portId: 'left0',
						// 			alignment: '1 1 0 4.55',
						// 		},
						// 	],
						// 	topArray: [
						// 		{
						// 			portId: 'top0',
						// 		},
						// 	],
						// 	bottomArray: [
						// 		{
						// 			portId: 'bottom0',
						// 		},
						// 	],
						// 	rightArray: [
						// 		{
						// 			portId: 'right0',
						// 		},
						// 		{
						// 			portId: 'right1',
						// 			alignment: '1 1 0 5.55',
						// 		},
						// 	],
						// },
					]
				}
				linkDataArray={
					[
						// { from: 1, to: 2, fromPort: 'top0', toPort: 'left0' },
						// { from: 1, to: 2, fromPort: 'right1', toPort: 'left1' },
						// { from: 3, to: 2, fromPort: 'top0', toPort: 'bottom1' },
						// { from: 4, to: 3, fromPort: 'right1', toPort: 'left2' },
						// { from: 4, to: 2, fromPort: 'top0', toPort: 'bottom0' },
					]
				}
				// onModelChange={handleModelChange}
			/>
		</>
	);
};
function applyPatch(diagram: Diagram, graphPatch: GraphPatch) {
	console.log('PATCH¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤', graphPatch);
	diagram.commit((d) => {
		for (const a of graphPatch) {
			switch (a.action) {
				case 'add':
					addAssertion(d, a.assertion);
					break;
				case 'remove':
					break;
			}
		}
	});
}
