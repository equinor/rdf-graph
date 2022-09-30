import go from 'gojs';

export function createDefaultNodeTemplate(clickHandler?: (e: go.InputEvent, thisObj: go.GraphObject) => void): go.Node {
	return (
		new go.Node(go.Panel.Auto, {
			name: 'NODE',
			background: 'transparent',
			resizable: false,
			click: clickHandler,
			selectable: true,
			selectionAdorned: false,
			scale: 1,
			maxSize: new go.Size(120, NaN),
			// width: 140,
			// height: 70,
		})
			.add(
				new go.Panel(go.Panel.Table, {
					// background: 'red',
					//maxSize: new go.Size(120, 120),
					//width: 120,
					isPanelMain: true,
				})
					.add(
						new go.Shape({
							row: 0,
							column: 0,
							name: 'SHAPE',
							fill: '#243746',
							figure: 'RoundedRectangle',
							strokeWidth: 1,
							stretch: go.GraphObject.Fill,
							// width: 120,
						})
							.bind('figure', 'shape', (v) => (v ? v : 'RoundedRectangle'))
							.bind(new go.Binding('fill', 'uiTheme', ({ node }) => node.fill).ofModel())
							.bind(
								new go.Binding('stroke', 'uiTheme', ({ node }, { panel: { data } }) =>
									data?.highlightStrokeColor ? node.highlight : node.stroke
								).ofModel()
							)
					)
					.add(
						new go.Shape({
							row: 0,
							column: 0,

							name: 'SHAPE2',
							fill: 'transparent',
							figure: 'RoundedRectangle',
							stroke: 'transparent',
							strokeWidth: 2,
							stretch: go.GraphObject.Fill,
							//width: 120,
						})
							.bind('figure', 'shape', (v) => (v ? v : 'RoundedRectangle'))
							// .bind(new go.Binding('fill', 'uiTheme', ({ node }) => node.fill).ofModel())
							.bind(
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
									) => (v ? uiTheme.node.highlight : 'transparent')
								)
							)
					)
					.add(
						// new go.Panel(go.Panel.Table, { margin: 6 }).add(
						new go.TextBlock('Hello', {
							row: 0,
							column: 0,
							// alignment: go.Spot.Left,
							// background: 'green',
							margin: 8,
							editable: false,
							wrap: go.TextBlock.OverflowEllipsis,
							textAlign: 'left',
							stretch: go.GraphObject.Horizontal,
							// maxSize: new go.Size(120, NaN),
						})
							.bind('text', 'label')
							.bind(
								new go.Binding(
									'stroke',
									'isSelected',
									(
										v,
										{
											diagram: {
												model: {
													modelData: { uiTheme },
												},
											},
										}
									) => (v ? uiTheme.node.highlight : uiTheme.node.text)
								).ofObject()
							)
						// )
					)
			)

			// .bind(new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify))
			.bind(new go.Binding('toSpot', 'setPortDirection', (v) => (v ? go.Spot.TopSide : go.Spot.None)).ofModel())
			.bind(new go.Binding('fromSpot', 'setPortDirection', (v) => (v ? go.Spot.BottomSide : go.Spot.None)).ofModel())
	);
}
