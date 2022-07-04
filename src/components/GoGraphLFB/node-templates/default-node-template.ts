import go from 'gojs';

export function createDefaultNodeTemplate(clickHandler?: (e: go.InputEvent, thisObj: go.GraphObject) => void): go.Node {
	const $ = go.GraphObject.make;

	return $(
		go.Node,
		'Auto',
		new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
		$(go.Shape, 'RoundedRectangle', { name: 'SHAPE', fill: 'lightgreen', strokeWidth: 0 }, new go.Binding('fill', 'color')),
		$(go.TextBlock, { margin: 8, editable: true }, new go.Binding('text').makeTwoWay()),
		{
			click: clickHandler,
		}
	);
}
