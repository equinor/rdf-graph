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
				figure: 'RoundedRectangle',
				strokeWidth: 3,
			},
			new go.Binding('figure', 'shape', (v) => (v ? v : 'RoundedRectangle')),
			new go.Binding('fill', 'uiTheme', ({ node }) => node.fill).ofModel(), // meaning a property of Model.modelData
			new go.Binding('stroke', 'uiTheme', ({ node }, { panel: { data } }) =>
				data?.highlightStrokeColor ? node.highlight : node.fill
			).ofModel(), // meaning a property of Model.modelData

			new go.Binding(
				'stroke',
				'highlightStrokeColor',
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
			// new go.Binding('strokeWidth', 'highlightStrokeColor', (v) => (v ? 3 : 1)),
			new go.AnimationTrigger('stroke'),
			new go.AnimationTrigger('fill')
			// new go.AnimationTrigger('strokeWidth')
		),
		$(go.TextBlock, { margin: 8, editable: true }, new go.Binding('text', 'label')),
		new go.Binding('fromSpot', 'setPortDirection', (v) => (v ? go.Spot.BottomSide : go.Spot.None)).ofModel(),
		new go.Binding('toSpot', 'setPortDirection', (v) => (v ? go.Spot.TopSide : go.Spot.None)).ofModel(),
		{
			click: clickHandler,
			// fromSpot: go.Spot.BottomSide,
			// toSpot: go.Spot.TopSide,
		}
	);
	// $(
	// 	go.Shape,
	// 	{
	// 		name: 'SHAPE',
	// 		fill: 'lightgreen',
	// 	},
	// 	new go.Binding('fill', 'uiTheme', ({ node }) => node.fill).ofModel(), // meaning a property of Model.modelData
	// 	new go.Binding('figure', 'shape'),
	// 	new go.Binding('stroke', 'highlightStrokeColor', (v) => v ?? 'black'),
	// 	new go.Binding('strokeWidth', 'highlightStrokeColor', (v) => (v ? 3 : 1)),
	// 	new go.AnimationTrigger('stroke'),
	// 	new go.AnimationTrigger('fill'),
	// 	new go.AnimationTrigger('strokeWidth')
	// ),
	// $(go.TextBlock, { margin: 8, editable: true }, new go.Binding('text', 'label')),
	// new go.Binding('fromSpot', 'setPortDirection', (v) => (v ? go.Spot.BottomSide : go.Spot.None)),
	// new go.Binding('toSpot', 'setPortDirection', (v) => (v ? go.Spot.TopSide : go.Spot.None)),
	// {
	// 	click: clickHandler,
	// 	// fromSpot: go.Spot.BottomSide,
	// 	// toSpot: go.Spot.TopSide,
	// }
	// );
}
