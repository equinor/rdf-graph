import go from 'gojs';

export function createDefaultLinkTemplate(): go.Link {
	const $ = go.GraphObject.make;

	return $(
		go.Link,
		{
			routing: go.Link.Orthogonal,
			curve: go.Link.JumpGap,
			corner: 5,
		},
		$(
			// default line
			go.Shape,
			{
				isPanelMain: true,
				strokeWidth: 1,
			},
			new go.Binding('stroke', 'uiTheme', ({ link }) => link.stroke).ofModel() // meaning a property of Model.modelData
		),
		$(
			// Highglight line
			go.Shape,
			{
				// name: 'HIGHLIGHT',
				toArrow: 'Triangle',
				isPanelMain: true,
				strokeWidth: 3,
				stroke: 'transparent',
			},
			new go.Binding('stroke', 'highlightStrokeColor', (v, m) => (v ? m.diagram.model.modelData.uiTheme.link.highlight : 'transparent')),
			new go.Binding('stroke', 'uiTheme', (v, o) => (o.stroke !== 'transparent' ? v.link.highlight : 'transparent')).ofModel(),

			new go.AnimationTrigger('stroke')
		)
	);

	// return $(
	// 	go.Link,
	// 	{ routing: go.Link.Orthogonal, curve: go.Link.JumpGap, corner: 5 }, // link route should avoid nodes
	// 	// $(go.Shape),
	// 	$(
	// 		go.Shape,
	// 		{
	// 			toArrow: 'Triangle',
	// 		},

	// 		new go.Binding('stroke', 'uiTheme', ({ link }) => link.stroke).ofModel(), // meaning a property of Model.modelData
	// 		new go.Binding('stroke', 'highlightStrokeColor', (v, s) => (v ? v : (s as go.Part).diagram?.model.modelData.uiTheme.link.stroke))
	// 	)
	// );
}
