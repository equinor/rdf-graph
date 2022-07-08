import go from 'gojs';
import { itemTemplateMap } from '../item-templates/item-templates-map';

export function createEdgeConnectorNodeTemplate(clickHandler?: ((e: go.InputEvent, thisObj: go.GraphObject) => void) | null): go.Node {
	const $ = go.GraphObject.make;

	const node = new go.Node(go.Panel.Spot, {
		click: clickHandler,
		// rotationSpot: go.Spot.Bottom,
		selectable: true,
	});

	node.bind(new go.Binding('background', 'background').makeTwoWay())
		.add(
			new go.Shape('Rectangle', {
				fill: 'transparent',
				strokeWidth: 0,
				alignment: go.Spot.Bottom,
			})
			// .bind(new go.Binding('fill', 'fill').makeTwoWay())
		)
		.add(
			new go.TextBlock({
				alignment: go.Spot.Center,
				textAlign: 'center',
				font: 'bold 14px Segoe UI,sans-serif',
				stroke: '#484848',
				// alignmentFocus: go.Spot.Bottom,
			}).bind(new go.Binding('text', 'label').makeTwoWay())
		)
		// .add(
		// 	new go.Panel(go.Panel.Position)
		// 		.add(
		// 			// Connector panel
		// 			new go.Panel(go.Panel.Position, {
		// 				itemCategoryProperty: 'category',
		// 				itemTemplateMap,
		// 			})
		// 				.bind('itemArray', 'ports')
		// 				.bind('width')
		// 		)
		// 		.bind(new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify))
		// );
		.add(
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
						// contextMenu: portMenu
					},
					new go.Binding('portId', 'portId'),
					$(
						go.Shape,
						'Rectangle',
						{
							stroke: null,
							strokeWidth: 0,
							desiredSize: new go.Size(8, 8),
							margin: new go.Margin(0, 1),
						},
						new go.Binding('fill', 'portColor')
					)
				), // end itemTemplate
			}) // end Horizontal Panel
		);

	return node;
}
