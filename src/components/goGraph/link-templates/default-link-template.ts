import go from 'gojs';

export function createDefaultLinkTemplate(): go.Link {
	const $ = go.GraphObject.make;

	return $(
		go.Link,
		{ routing: go.Link.Orthogonal, curve: go.Link.JumpGap, corner: 5 }, // link route should avoid nodes
		// $(go.Shape),
		$(
			go.Shape,
			{
				toArrow: 'Triangle',
			},

			new go.Binding('stroke', 'uiTheme', ({ link }) => link.stroke).ofModel(), // meaning a property of Model.modelData
			new go.Binding('stroke', 'highlightStrokeColor', (v, s) => (v ? v : (s as go.Part).diagram?.model.modelData.uiTheme.link.stroke))
		)
	);
}
