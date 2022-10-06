import go from 'gojs';

export function portDirectionToSpot(direction: number): go.Spot {
	switch (direction) {
		case 0:
			return go.Spot.TopSide;
		case 90:
			return go.Spot.RightSide;
		case 180:
			return go.Spot.BottomSide;
		case 270:
			return go.Spot.LeftSide;
		default:
			return go.Spot.Center;
	}
}

export function createDefaultItemTemplate(): go.Panel {
	const $ = go.GraphObject.make;

	return $(
		go.Panel,
		'Position',
		$(
			go.TextBlock,
			new go.Binding('text', 'name', (v, _e) => {
				return v;
			})
		),
		$(
			go.Shape,
			'Circle',
			{
				name: 'CONN',
				fill: 'blue',
				strokeWidth: 0,
				opacity: 0.6,
				fromEndSegmentLength: 50,
				toEndSegmentLength: 50,
			},
			new go.Binding('portId'),
			new go.Binding('height', 'portSize').ofModel(),
			new go.Binding('width', 'portSize').ofModel()
		)
	);
}

export function createPositionPortItemTemplate(): go.Panel {
	const $ = go.GraphObject.make;
	return $(
		go.Panel,
		'Position',
		$(
			go.Shape,
			'Circle',
			{
				name: 'CONN',
				fill: 'blue',
				strokeWidth: 0,
				opacity: 0.6,
				fromEndSegmentLength: 50,
				toEndSegmentLength: 50,
			},
			new go.Binding('portId'),
			new go.Binding('position', 'relativePosition', (pos) => {
				return new go.Point(pos.x, pos.y);
			}),
			new go.Binding('position', 'portSize', (size, shape: go.Shape) => {
				const pos = shape.position;
				return new go.Point(pos.x - size / 2, pos.y - size / 2);
			}).ofModel(),
			new go.Binding('fromSpot', 'direction', portDirectionToSpot),
			new go.Binding('toSpot', 'direction', portDirectionToSpot),
			new go.Binding('height', 'portSize').ofModel(),
			new go.Binding('width', 'portSize').ofModel()
		)
	);
}
