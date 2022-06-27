import ReactDOMServer from 'react-dom/server';
import { GraphLinksModel, GraphObject, TextBlock, Binding, Diagram, Picture, Margin, Shape, Point, Panel, Spot, Node, Size, Link } from 'gojs';
import { ReactDiagram } from 'gojs-react';
import { Icon } from '@equinor/engineering-symbols';

import svg from './images/ArrowRight.svg';

import { CustomLink } from './CustomLink';

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

console.log(81, 'myImg:', myImg, 'svg:', svg);

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
			linkKeyProperty: 'key', // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
			linkFromPortIdProperty: 'fromPort',
			linkToPortIdProperty: 'toPort',
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
				'Rectangle',
				// HERE: BG

				{
					fill: '#fff',
					stroke: '#dbf6cb',
					strokeWidth: 0,
					// fromSpot: new go.Spot(0.5, 0.25), toSpot: new go.Spot(0.5, 0.75),
					// toSpot: go.Spot.Top,
					minSize: new Size(48, 48),
				}
			),

			$(
				Picture,
				// { maxSize: new go.Size(50, 50) },
				// new go.Binding("source", "img")),
				{
					// source: 'images/sample.png',
					width: 48,
					height: 48,
					element: myImg,
					// element: drawHandCanvas(),
				}
				// new Binding("source", "icon", makeImagePath)
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

export const GoGraph = () => {
	return (
		<>
			<ReactDiagram
				style={{ height: '1000px', width: '1000px' }}
				initDiagram={initDiagram}
				divClassName="graph-links-model"
				nodeDataArray={[
					{
						key: 1,
						icon: 'ArrowRight.svg',
						alg: '1, 1, 0, 5.51',
						leftArray: [
							{
								portColor: '#fae3d7',
								portId: 'left0',
							},
						],
						topArray: [{ portColor: '#d6effc', portId: 'top0' }],
						rightArray: [
							{
								portColor: '#000000',
								portId: 'right1',
							},
						],
					},
					{
						key: 2,
						icon: '55x55.png',
						leftArray: [
							{
								portColor: '#6cafdb',
								portId: 'left0',
							},
							{
								portColor: '#66d6d1',
								portId: 'left1',
							},
							{
								portColor: '#fae3d7',
								portId: 'left2',
							},
						],
						topArray: [
							{
								portColor: '#d6effc',
								portId: 'top0',
							},
						],
						bottomArray: [
							{
								portColor: '#eaeef8',
								portId: 'bottom0',
							},
							{
								portColor: '#eaeef8',
								portId: 'bottom1',
							},
							{
								portColor: '#6cafdb',
								portId: 'bottom2',
							},
						],
						rightArray: [],
					},
					{
						key: 3,
						icon: '60x90.png',
						leftArray: [
							{
								portColor: '#66d6d1',
								portId: 'left0',
							},
							{
								portColor: '#fadfe5',
								portId: 'left1',
							},
							{
								portColor: '#6cafdb',
								portId: 'left2',
							},
						],
						topArray: [
							{
								portColor: '#66d6d1',
								portId: 'top0',
							},
						],
						bottomArray: [
							{
								portColor: '#6cafdb',
								portId: 'bottom0',
							},
						],
						rightArray: [],
						group: 'Group1',
					},
					{
						key: 4,
						icon: '80x50.png',
						leftArray: [
							{
								portColor: '#fae3d7',
								portId: 'left0',
							},
						],
						topArray: [
							{
								portColor: '#6cafdb',
								portId: 'top0',
							},
						],
						bottomArray: [
							{
								portColor: '#6cafdb',
								portId: 'bottom0',
							},
						],
						rightArray: [
							{
								portColor: '#6cafdb',
								portId: 'right0',
							},
							{
								portColor: '#66d6d1',
								portId: 'right1',
							},
						],
					},
				]}
				linkDataArray={[
					{ from: 1, to: 2, fromPort: 'top0', toPort: 'left0' },
					{ from: 1, to: 2, fromPort: 'right1', toPort: 'left1' },
					{ from: 3, to: 2, fromPort: 'top0', toPort: 'bottom1' },
					{ from: 4, to: 3, fromPort: 'right1', toPort: 'left2' },
					{ from: 4, to: 2, fromPort: 'top0', toPort: 'bottom0' },
				]}
				// onModelChange={handleModelChange}
			/>
		</>
	);
};
