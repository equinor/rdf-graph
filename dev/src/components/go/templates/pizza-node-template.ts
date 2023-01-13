import * as go from 'gojs';

export function createPizzaNodeTemplate(
	clickHandler?: (e: go.InputEvent, thisObj: go.GraphObject) => void
): go.Node {
	return new go.Node(go.Panel.Vertical, {
		resizable: false,
		click: clickHandler,
	})
		.add(new go.Picture('/pizza.svg', { desiredSize: new go.Size(100, 100) }))
		.add(
			new go.TextBlock('<NoLabel>', {
				margin: 8,
				wrap: go.TextBlock.WrapFit,
				stroke: 'orange',
				font: '20px "Comic Sans MS"',
			}).bind('text', 'label')
		);
}
