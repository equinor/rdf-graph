import go from 'gojs';
import { PortBearing } from '../symbol-api/types/NodeSymbolConnector';

export function portBearingToSpot(bearing: PortBearing): go.Spot {
	switch (bearing) {
		case PortBearing.N:
			return go.Spot.TopSide;
		case PortBearing.E:
			return go.Spot.RightSide;
		case PortBearing.S:
			return go.Spot.BottomSide;
		case PortBearing.W:
			return go.Spot.LeftSide;
		default:
			return go.Spot.Center;
	}
}

export function createSymbolPortItemTemplate(): go.Panel {
	const $ = go.GraphObject.make;
	console.log(10101010101);
	return $(
		go.Panel,
		'Position',
		{
			_side: 'bottom',
			fromSpot: go.Spot.Bottom,
			toSpot: go.Spot.Bottom,
		},
		//{ alignment: new go.Spot(0, 0) },
		$(
			go.Shape,
			'Circle', //"Rectangle",
			{
				name: 'CONN',
				// fromSpot: go.Spot.LeftSide,
				// toSpot: go.Spot.LeftSide,
				// fill: "red",
				// stroke: "red",
				strokeWidth: 0,
				opacity: 1,
				// width: 1,
				// height: 1,
				fromEndSegmentLength: 50,
				toEndSegmentLength: 50,
			},
			new go.Binding('portId'),
			//  new go.Binding("position", "position", (pos: go.Point) => {
			//    return new go.Point(pos.x - 0.5, pos.y - 0.5);
			//  }),
			new go.Binding('position', 'position', (pos: go.Point) => {
				return new go.Point(pos.x, pos.y);
			}),
			new go.Binding('position', 'portSize', (size, shape: go.Shape) => {
				const pos = shape.position;
				// console.log(91, pos);

				return new go.Point(pos.x - size / 2, pos.y - size / 2);
			}).ofModel(),
			new go.Binding('fromSpot', 'portBearing', (b) => portBearingToSpot(b)),
			new go.Binding('toSpot', 'portBearing', (b) => portBearingToSpot(b)),
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
