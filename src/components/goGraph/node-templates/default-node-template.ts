import go from 'gojs';

export function createDefaultNodeTemplate(clickHandler?: (e: go.InputEvent, thisObj: go.GraphObject) => void): go.Node {
	const $ = go.GraphObject.make;

	return $(
		go.Node,
		'Auto',
		new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
		$(
			go.Shape,
			{
				name: 'SHAPE',
				fill: 'lightgreen',
			},
			new go.Binding('fill', 'nodeColor').ofModel(), // meaning a property of Model.modelData
			new go.Binding('figure', 'nodeTemplate').makeTwoWay(),
			new go.Binding('stroke', 'highlightStrokeColor', (v) => v ?? 'black'),
			new go.Binding('strokeWidth', 'highlightStrokeColor', (v) => (v ? 3 : 1))
		),
		$(go.TextBlock, { margin: 8, editable: true }, new go.Binding('text', 'label').makeTwoWay()),
		{
			click: clickHandler,
			fromSpot: go.Spot.BottomSide,
			toSpot: go.Spot.TopSide,
		}
	);
}
