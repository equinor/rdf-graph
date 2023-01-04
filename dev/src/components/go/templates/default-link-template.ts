import * as go from 'gojs';

export function createDefaultLinkTemplate(): go.Link {
	const $ = go.GraphObject.make;
	const fill = '#ccc';
	return $(
		go.Link,
		{
			routing: go.Link.AvoidsNodes,
			curve: go.Link.Default,
			corner: 0,
		},
		$(go.Shape)
			.bind('stroke', 'stroke', (v) => (v ? v : fill))
			.bind('label'), // the link shape
		$(
			go.Shape, // the arrowhead
			{ toArrow: 'Triangle', stroke: fill, fill: fill }
		)
	);
}
