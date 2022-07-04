import go from 'gojs';
import { itemTemplateMap } from '../item-templates/item-templates-map';

export function createRCTNodeTemplate(clickHandler?: ((e: go.InputEvent, thisObj: go.GraphObject) => void) | null): go.Node {
	const $ = go.GraphObject.make;
	return (
		new go.Node(go.Panel.Spot, {
			// background: 'transparent',
			// background: '#FF5733',
			click: clickHandler,
			// rotationSpot: go.Spot.Bottom,
			selectable: true,
		})
			.bind(new go.Binding('background', 'background').makeTwoWay())
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
				}).bind(new go.Binding('text', 'text').makeTwoWay())
			)
			// .add(
			// 	$(go.Panel, 'Horizontal', new go.Binding('itemArray', 'ports'), {
			// 		row: 2,
			// 		column: 1,
			// 		itemTemplate: $(
			// 			go.Panel,
			// 			{
			// 				_side: 'bottom',
			// 				fromSpot: go.Spot.Bottom,
			// 				toSpot: go.Spot.Bottom,
			// 				fromLinkable: true,
			// 				toLinkable: true,
			// 				cursor: 'pointer',
			// 				// contextMenu: portMenu
			// 			},
			// 			new go.Binding('portId', 'portId'),
			// 			new go.Binding('alignment', 'alignment', go.Spot.parse).makeTwoWay(go.Spot.stringify)
			// 			// $(
			// 			// 	Shape,
			// 			// 	'Rectangle',
			// 			// 	{
			// 			// 		stroke: null,
			// 			// 		strokeWidth: 0,
			// 			// 		desiredSize: portSize,
			// 			// 		margin: new Margin(0, 1),
			// 			// 	},
			// 			// 	new Binding('fill', 'portColor')
			// 			// )
			// 		), // end itemTemplate
			// 	}) // end Horizontal Panel
			// )
			.add(
				new go.Panel(go.Panel.Position)
					.add(
						// Connector panel
						new go.Panel(go.Panel.Position, {
							itemCategoryProperty: 'type',
							itemTemplateMap,
							//position: new go.Point(),
						})
							.bind('itemArray', 'ports')
							.bind('width')
						// .bind('height')
						// .bind('fill')
					)
					// .bind(new go.Binding('angle').makeTwoWay())
					// .bind("width")
					// .bind("height")
					// .bind(new go.Binding('scale').makeTwoWay())
					.bind(new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify))
			)
	);
}
