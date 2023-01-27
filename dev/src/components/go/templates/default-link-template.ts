import * as go from 'gojs';

export function createDefaultLinkTemplate(): go.Link {
	const fill = '#ccc';

	return (
		new go.Link({ routing: go.Link.AvoidsNodes, curve: go.Link.Default, corner: 0 })
			.add(
				new go.Shape({ stroke: fill })
					.bind('stroke', 'stroke', (v) => (v ? v : fill))
					.bind('stroke', 'custom_highlight', (v) => (v === 'true' ? 'yellow' : fill))
					.bind('label')
			)
			//.add(new go.Shape().bind('stroke', 'stroke', (v) => (v ? v : fill)).bind('label'))
			.add(new go.Shape({ toArrow: 'Triangle', stroke: fill, fill: fill }))
	);
}
