import go from 'gojs';
import { PortDirection } from '../../../symbol-api';

export function portDirectionToSpot(direction: PortDirection): go.Spot {
	switch (direction) {
		case PortDirection.N:
			return go.Spot.TopSide;
		case PortDirection.E:
			return go.Spot.RightSide;
		case PortDirection.S:
			return go.Spot.BottomSide;
		case PortDirection.W:
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
			new go.Binding('text', 'name', (v, e) => {
				return v;
			})
		),
		// new go.Binding('category'),
		$(
			go.Shape,
			'Circle', //"Rectangle",
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
			'Circle', //"Rectangle",
			{
				name: 'CONN',
				fill: 'blue',
				strokeWidth: 0,
				opacity: 0.6,
				fromEndSegmentLength: 50,
				toEndSegmentLength: 50,
			},
			new go.Binding('portId'),
			new go.Binding('position', 'relativePosition'),
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
