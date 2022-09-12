import go from 'gojs';

export function createDefaultNodeTemplate(clickHandler?: (e: go.InputEvent, thisObj: go.GraphObject) => void): go.Node {
	const $ = go.GraphObject.make;

	return $(
		go.Node,
		'Auto',
		$(
			go.Shape,
			{
				name: 'SHAPE',
				fill: 'lightgreen',
				figure: 'RoundedRectangle',
				strokeWidth: 3,
			},
			new go.Binding('figure', 'shape', (v) => (v ? v : 'RoundedRectangle')),
			new go.Binding('fill', 'uiTheme', ({ node }) => node.fill).ofModel(),
			new go.Binding('stroke', 'uiTheme', ({ node }, { panel: { data } }) =>
				data?.highlightStrokeColor ? node.highlight : node.fill
			).ofModel(),
			new go.Binding(
				'stroke',
				'highlight',
				(
					v,
					{
						diagram: {
							model: {
								modelData: { uiTheme },
							},
						},
					}
				) => (v ? uiTheme.node.highlight : uiTheme.node.fill)
			),
			new go.AnimationTrigger('stroke'),
			new go.AnimationTrigger('fill')
		),
		$(go.TextBlock, { margin: 8, editable: true }, new go.Binding('text', 'label')),
		new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
		new go.Binding('toSpot', 'setPortDirection', (v) => (v ? go.Spot.TopSide : go.Spot.None)).ofModel(),
		new go.Binding('fromSpot', 'setPortDirection', (v) => (v ? go.Spot.BottomSide : go.Spot.None)).ofModel(),

		{
			click: clickHandler,
			// fromSpot: go.Spot.BottomSide,
			// toSpot: go.Spot.TopSide,
		}
	);
}
