import go from 'gojs';

export function createDefaultLinkTemplate(): go.Link {
	const $ = go.GraphObject.make;
	return $(
		go.Link,
		{ routing: go.Link.AvoidsNodes, curve: go.Link.JumpGap }, // link route should avoid nodes
		$(go.Shape),
		$(go.Shape, { toArrow: 'Triangle' })
	);
}
