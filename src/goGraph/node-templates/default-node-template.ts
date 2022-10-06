import go from 'gojs';

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
		)
		.bind(new go.Binding('toSpot', 'setPortDirection', (v) => (v ? go.Spot.TopSide : go.Spot.None)).ofModel())
		.bind(new go.Binding('fromSpot', 'setPortDirection', (v) => (v ? go.Spot.BottomSide : go.Spot.None)).ofModel());
}
