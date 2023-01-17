import * as go from 'gojs';

export function createDefaultGroupTemplate(): go.Group {
	const $ = go.GraphObject.make;

	return $(
		go.Group,
		'Vertical',
		$(
			go.Panel,
			'Auto',
			$(
				go.Shape,
				'RoundedRectangle', // surrounds the Placeholder
				{ parameter1: 14, fill: 'rgba(128,128,128,0.33)' }
			),
			$(
				go.Placeholder, // represents the area of all member parts,
				{ padding: 5 }
			) // with some extra padding around them
		),
		$(
			go.TextBlock, // group title
			{ alignment: go.Spot.Right, font: 'Bold 12pt Sans-Serif' },
			new go.Binding('text', 'label')
		)
	);
}
