import go from 'gojs';

export function createEdgeConnectorNodeTemplate(_clickHandler?: ((e: go.InputEvent, thisObj: go.GraphObject) => void) | null): go.Node {
	const $ = go.GraphObject.make;
	const portSize = new go.Size(8, 8);
	return $(
		go.Node,
		'Table',
		{
			locationObjectName: 'BODY',
			locationSpot: go.Spot.Center,
			selectionObjectName: 'BODY',
		},

		// the body
		$(
			go.Panel,
			'Auto',
			{
				row: 1,
				column: 1,
				name: 'BODY',
			},
			$(go.Shape, 'Rectangle', {
				fill: '#dbf6cb',
				stroke: null,
				strokeWidth: 0,
			}),
			$(
				go.TextBlock,
				{ margin: 10, textAlign: 'center', font: 'bold 14px Segoe UI,sans-serif', stroke: '#484848', editable: true },
				new go.Binding('text', 'label').makeTwoWay()
			)
		), // end Auto Panel body

		// the Panel holding the left port elements, which are themselves Panels,
		// created for each item in the itemArray, bound to data.leftArray
		$(go.Panel, 'Vertical', new go.Binding('itemArray', 'westArray'), {
			row: 1,
			column: 0,
			itemTemplate: $(
				go.Panel,
				{
					_side: 'left', // internal property to make it easier to tell which side it's on
					fromSpot: go.Spot.Left,
					toSpot: go.Spot.Left,
					fromLinkable: true,
					toLinkable: true,
					cursor: 'pointer',
				},
				new go.Binding('portId', 'portId'),
				$(
					go.Shape,
					'Rectangle',
					{
						stroke: null,
						strokeWidth: 0,
						desiredSize: portSize,
						margin: new go.Margin(1, 0),
					},
					new go.Binding('fill', 'portColor')
				)
			), // end itemTemplate
		}), // end Vertical Panel

		// the Panel holding the top port elements, which are themselves Panels,
		// created for each item in the itemArray, bound to data.topArray
		$(go.Panel, 'Horizontal', new go.Binding('itemArray', 'northArray'), {
			row: 0,
			column: 1,
			itemTemplate: $(
				go.Panel,
				{
					_side: 'top',
					fromSpot: go.Spot.Top,
					toSpot: go.Spot.Top,
					fromLinkable: true,
					toLinkable: true,
					cursor: 'pointer',
					//   contextMenu: portMenu
				},
				new go.Binding('portId', 'portId'),
				$(
					go.Shape,
					'Rectangle',
					{
						stroke: null,
						strokeWidth: 0,
						desiredSize: portSize,
						margin: new go.Margin(0, 1),
					},
					new go.Binding('fill', 'portColor')
				)
			), // end itemTemplate
		}), // end Horizontal Panel

		// the Panel holding the right port elements, which are themselves Panels,
		// created for each item in the itemArray, bound to data.rightArray
		$(go.Panel, 'Vertical', new go.Binding('itemArray', 'eastArray'), {
			row: 1,
			column: 2,
			itemTemplate: $(
				go.Panel,
				{
					_side: 'right',
					fromSpot: go.Spot.Right,
					toSpot: go.Spot.Right,
					fromLinkable: true,
					toLinkable: true,
					cursor: 'pointer',
				},
				new go.Binding('portId', 'portId'),
				$(
					go.Shape,
					'Rectangle',
					{
						stroke: null,
						strokeWidth: 0,
						desiredSize: portSize,
						margin: new go.Margin(1, 0),
					},
					new go.Binding('fill', 'portColor')
				)
			), // end itemTemplate
		}), // end Vertical Panel

		// the Panel holding the bottom port elements, which are themselves Panels,
		// created for each item in the itemArray, bound to data.bottomArray
		$(go.Panel, 'Horizontal', new go.Binding('itemArray', 'southArray'), {
			row: 2,
			column: 1,
			itemTemplate: $(
				go.Panel,
				{
					_side: 'bottom',
					fromSpot: go.Spot.Bottom,
					toSpot: go.Spot.Bottom,
					fromLinkable: true,
					toLinkable: true,
					cursor: 'pointer',
					//   contextMenu: portMenu
				},
				new go.Binding('portId', 'portId'),
				$(
					go.Shape,
					'Rectangle',
					{
						stroke: null,
						strokeWidth: 0,
						desiredSize: portSize,
						margin: new go.Margin(0, 1),
					},
					new go.Binding('fill', 'portColor')
				)
			), // end itemTemplate
		}) // end Horizontal Panel
	);
}
