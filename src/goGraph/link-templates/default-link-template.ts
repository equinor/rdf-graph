import go from 'gojs';

export function createDefaultLinkTemplate(): go.Link {
	const $ = go.GraphObject.make;

	return $(
		go.Link,
		{
			routing: go.Link.AvoidsNodes,
			curve: go.Link.JumpGap,
			corner: 0,
		},
		// The MAIN line
		$(
			go.Shape,
			{
				isPanelMain: true,
				strokeWidth: 1,
			},
			new go.Binding('stroke', 'uiTheme', ({ link }) => link.stroke).ofModel()
		),
		// Highlighted line
		$(
			go.Shape,
			{
				isPanelMain: true,
				strokeWidth: 3,
				stroke: 'transparent',
			},
			new go.Binding('stroke', 'highlight', (v, m) => (v ? m.diagram.model.modelData.uiTheme.link.highlight : 'transparent')),
			new go.Binding('stroke', 'uiTheme', (v, o) => (o.stroke !== 'transparent' ? v.link.highlight : 'transparent')).ofModel(),
			new go.AnimationTrigger('stroke', { duration: 300 })
		),
		// The arrow head
		$(
			go.Shape,
			{
				toArrow: 'Triangle',
				strokeWidth: 1,
			},
			new go.Binding('stroke', 'uiTheme', ({ link }) => link.stroke).ofModel(),
			new go.Binding('fill', 'uiTheme', ({ link }) => link.stroke).ofModel(),
			new go.Binding('stroke', 'highlight', (v, m) => {
				return v ? m.diagram.model.modelData.uiTheme.link.highlight : m.diagram.model.modelData.uiTheme.link.stroke;
			}),
			new go.Binding('fill', 'highlight', (v, m) => {
				return v ? m.diagram.model.modelData.uiTheme.link.highlight : m.diagram.model.modelData.uiTheme.link.stroke;
			})
		)
	);
}
