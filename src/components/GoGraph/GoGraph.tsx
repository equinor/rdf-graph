import { GraphLinksModel, GraphObject, TextBlock, Binding, Diagram, Picture, Margin, Shape, Point, Panel, Spot, Node, Size, Link, Rect } from 'gojs';
import { ReactDiagram } from 'gojs-react';

import { CustomLink } from './CustomLink';
import { GraphStateProps } from '../state/GraphStateProps';
import { useEffect, useRef, useState } from 'react';
import { GraphAssertion, GraphEdge, GraphNode, GraphPatch, GraphPropertyIdentifier } from '../../models/graphModel';
import { NodeSymbol } from '../../symbol-api/types/NodeSymbol';

const nodeClicked = (e: any, obj: any) => {
	// executed by click and doubleclick handlers
	// console.log(100, obj.part.data)
	// console.log(1, obj.part.findTreeRoot().data);
	obj.part.findNodesConnected().each(function (n: any) {
		console.log(13, n.part.data);
	});
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
		new Binding('angle', 'angle'),
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
				new Binding('alignment', 'alignment', Spot.parse).makeTwoWay(Spot.stringify)
				// $(
				// 	Shape,
				// 	'Rectangle',
				// 	{
				// 		stroke: null,
				// 		strokeWidth: 0,
				// 		desiredSize: portSize,
				// 		margin: new Margin(1, 0),
				// 	},
				// 	new Binding('fill', 'portColor')
				// )
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
					// alignment: new Spot(1, 1, 0, 0),
					fromSpot: Spot.Top,
					toSpot: Spot.Top,
					fromLinkable: true,
					toLinkable: true,
					cursor: 'pointer',
					// contextMenu: portMenu
				},
				new Binding('portId', 'portId'),
				new Binding('alignment', 'alignment', Spot.parse).makeTwoWay(Spot.stringify)
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
					// alignment: new Spot(1, 1, 0, 5.51),
					fromSpot: Spot.Right,
					toSpot: Spot.Right,
					fromLinkable: true,
					toLinkable: true,
					cursor: 'pointer',
					// stroke: "black",
					// contextMenu: portMenu
				},
				new Binding('portId', 'portId'),
				new Binding('alignment', 'alignment', Spot.parse).makeTwoWay(Spot.stringify)

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
				new Binding('alignment', 'alignment', Spot.parse).makeTwoWay(Spot.stringify)
				// $(
				// 	Shape,
				// 	'Rectangle',
				// 	{
				// 		stroke: null,
				// 		strokeWidth: 0,
				// 		desiredSize: portSize,
				// 		margin: new Margin(0, 1),
				// 	},
				// 	new Binding('fill', 'portColor')
				// )
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

export const GoGraph = ({ graphState, graphPatch }: GraphStateProps) => {
	const diagramRef = useRef<Diagram>(initDiagram());

	useEffect(() => {
		applyPatch(diagramRef.current, graphPatch);
	}, [graphPatch]);

	return (
		<>
			<ReactDiagram
				style={{ height: '1000px', width: '1000px' }}
				initDiagram={() => diagramRef.current}
				divClassName="graph-links-model"
				nodeDataArray={[]}
				linkDataArray={[]}
				// onModelChange={handleModelChange}
			/>
		</>
	);
};
