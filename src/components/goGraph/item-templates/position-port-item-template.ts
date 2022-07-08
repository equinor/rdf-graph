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

export function createPositionPortItemTemplate(): go.Panel {
	const $ = go.GraphObject.make;
	return $(
		go.Panel,
		'Position',
		//{ alignment: new go.Spot(0, 0) },
		$(
			go.Shape,
			'Circle', //"Rectangle",
			{
				name: 'CONN',
				// fromSpot: go.Spot.LeftSide,
				// toSpot: go.Spot.LeftSide,
				fill: 'blue',
				// stroke: "red",
				strokeWidth: 0,
				opacity: 0.6,
				// width: 1,
				// height: 1,
				fromEndSegmentLength: 50,
				toEndSegmentLength: 50,
			},
			new go.Binding('portId'),
			//  new go.Binding("position", "position", (pos: go.Point) => {
			//    return new go.Point(pos.x - 0.5, pos.y - 0.5);
			//  }),
			// new go.Binding('position', 'relativePosition', (pos: go.Point) => {
			// 	return new go.Point(pos.x, pos.y);
			// }),
			// new go.Binding('position', 'portSize', (size, shape: go.Shape) => {
			// 	const pos = shape.position;
			// 	return new go.Point(pos.x - size / 2, pos.y - size / 2);
			// }).ofModel(),
			new go.Binding('position', '', (obj) => {
				return null;
			}).ofObject(),
			new go.Binding('fromSpot', 'direction', (b) => portDirectionToSpot(b)),
			new go.Binding('toSpot', 'direction', (b) => portDirectionToSpot(b)),
			new go.Binding('height', 'portSize').ofModel(),
			// new go.Binding("width", "width", (obj: go.GraphObject) => {
			//   const sdsd = obj.position;

			//   return 2;
			// }).ofObject("CONN"),
			new go.Binding('width', 'portSize').ofModel()

			//new go.Binding("alignment")
		)
	);
}
