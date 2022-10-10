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
		$(go.Shape), // the link shape
		$(
			go.Shape, // the arrowhead
			{ toArrow: 'Triangle' }
		)
	);
}
