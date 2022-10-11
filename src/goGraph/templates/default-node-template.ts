import * as go from 'gojs';

export function createDefaultNodeTemplate(clickHandler?: (e: go.InputEvent, thisObj: go.GraphObject) => void): go.Node {
	return new go.Node(go.Panel.Auto, {
		resizable: false,
		click: clickHandler,
	})
		.add(
			new go.Shape({
				fill: 'lightgreen',
				figure: 'RoundedRectangle',
			})
				.bind('figure', 'shape', (v) => (v ? v : 'RoundedRectangle'))
				.bind('fill', 'color')
		)
		.add(
			new go.TextBlock('<NoLabel>', {
				margin: 8,
				wrap: go.TextBlock.OverflowEllipsis,
			}).bind('text', 'label')
		);
}
