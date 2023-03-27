import * as go from 'gojs';

export function createPizzaNodeTemplate(): go.Node {
	return new go.Node(go.Panel.Vertical, {
		resizable: false,
		click: () => console.info('You clicked on a pizza'),
	})
		.add(new go.Picture('/pizza.svg', { desiredSize: new go.Size(100, 100) }))
		.add(
			new go.TextBlock('<NoLabel: use custom prop "pizzaName">', {
				margin: 8,
				wrap: go.TextBlock.WrapFit,
				stroke: 'orange',
				font: '20px "Comic Sans MS"',
			}).bind('text', 'custom_pizzaName')
		);
}
