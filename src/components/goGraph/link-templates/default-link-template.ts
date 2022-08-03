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
			new go.Binding('stroke', 'uiTheme', ({ node }) => node.stroke).ofModel() // meaning a property of Model.modelData
		)
	);
}
