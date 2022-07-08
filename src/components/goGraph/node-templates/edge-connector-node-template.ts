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
			}).bind(new go.Binding('text', 'text').makeTwoWay())
		)
		.add(
			new go.Panel(go.Panel.Position)
				.add(
					// Connector panel
					new go.Panel(go.Panel.Position, {
						itemCategoryProperty: 'category',
						itemTemplateMap,
					})
						.bind('itemArray', 'ports')
						.bind('width')
				)
				.bind(new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify))
		);

	return node;
}
