import go from 'gojs';
import { itemTemplateMap } from '../item-templates/item-templates-map';
import { PortBearing } from '../types/NodeSymbolConnector';

export function createSymbolNodeTemplate(clickHandler?: ((e: go.InputEvent, thisObj: go.GraphObject) => void) | null): go.Node {
	const $ = go.GraphObject.make;
	return (
		new go.Node(go.Panel.Spot, {
			background: 'transparent',
			resizable: false,
			click: clickHandler,
			rotatable: true,
			rotationSpot: go.Spot.Center,
			selectable: true,
			scale: 1,
			contextMenu: $(
				'ContextMenu', // that has one button
				$(
					'ContextMenuButton',
					{
						'ButtonBorder.fill': 'white',
						_buttonFillOver: 'skyblue',
					},
					$(go.TextBlock, 'Console log'),
					{ click: () => console.log('Hello from ctx menu!') }
				)
				// more ContextMenuButtons would go here
			), // end Adornment
		})
			.add(
				new go.Shape('Rectangle', {
					isPanelMain: true,
					fill: 'transparent',
					strokeWidth: 0,
				})
			)
			.add(
				new go.TextBlock('', {
					alignment: go.Spot.TopCenter,
					alignmentFocus: go.Spot.TopCenter,
				})
					.bind(new go.Binding('text', 'key').ofObject())
					.bind(new go.Binding('angle', 'angle', (a) => -a).ofObject())
					.bind(
						new go.Binding('alignment', 'angle', (a: number) => {
							//console.log('a:', a);
							return getTopLabelAlignment(a);
						}).ofObject()
					)
					.bind(
						new go.Binding('alignmentFocus', 'angle', (a: number) => {
							//console.log("a:", a);
							return getTopLabelAlignment(a);
						}).ofObject()
					)
					.bind(new go.Binding('text', 'label'))
			)
			// .add(
			//   new go.TextBlock("Bottom Text", {
			//     alignment: go.Spot.BottomCenter,
			//     alignmentFocus: go.Spot.BottomCenter,
			//   })
			// )
			.add(
				new go.Panel(go.Panel.Position, { margin: 10 })
					.add(
						new go.Picture({
							//position: new go.Point(),
							background: 'transparent',
							//imageStretch: go.GraphObject.None,
						})
							.bind('source', 'svgDataURI')
							.bind('width')
							.bind('height')
					)
					.add(
						// Connector panel
						new go.Panel(go.Panel.Position, {
							itemCategoryProperty: 'type',
							itemTemplateMap: itemTemplateMap,
							//position: new go.Point(),
						})
							.bind('itemArray', 'ports')
							.bind('width')
							.bind('height')
					)
					.bind(new go.Binding('angle').makeTwoWay())
					// .bind("width")
					// .bind("height")
					.bind(new go.Binding('scale').makeTwoWay())
					.bind(new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify))
			)
	);
}

export function createRectangleNode(key: number, text: string, connecters: any[], background = '#FF5733') {
	const ports = [];

	const step = 100;
	const height = 200;

	const topConnectors = connecters.filter(({ direction }) => direction === 'in');
	const bootomConnectors = connecters.filter(({ direction }) => direction === 'out');

	const topAmount = topConnectors.length;
	const bottomAmount = bootomConnectors.length;

	// Finding max width between connectors
	const fmwbc = topAmount > bottomAmount ? topAmount : bottomAmount;

	// TOP
	for (let i = 0; i < topAmount; i++) {
		const { id } = topConnectors[i];
		const y = (height / 2) * -1;
		const x = step + step * i;

		ports.push({
			type: 'symbolPort',
			symbolId: id,
			position: new go.Point(x, y),
			portId: id,
			portBearing: PortBearing.N,
		});
	}

	// BOTTOM
	for (let i = 0; i < bottomAmount; i++) {
		const { id } = bootomConnectors[i];
		const y = height / 2;
		const x = step + step * i;

		ports.push({
			type: 'symbolPort',
			symbolId: id,
			position: new go.Point(x, y),
			portId: id,
			portBearing: PortBearing.S,
		});
	}

	return {
		key,
		height,
		width: step * fmwbc + step,
		category: 'rctNode',
		ports,
		text,
		background,
	};
}

function getTopLabelAlignment(angle: number): go.Spot {
	switch (angle) {
		case 0:
			return go.Spot.TopCenter;
		case 45:
			return go.Spot.TopLeft;
		case 90:
			return go.Spot.LeftCenter;
		case 135:
			return go.Spot.BottomLeft;
		case 180:
			return go.Spot.BottomCenter;
		case 225:
			return go.Spot.BottomRight;
		case 270:
			return go.Spot.RightCenter;
		case 315:
			return go.Spot.TopRight;
		default:
			return go.Spot.TopCenter;
	}
}

// var symbolNodeTemplate3 = $(
//   go.Node,
//   go.Panel.Spot,
//   {
//     locationObjectName: "SHAPE",
//     locationSpot: go.Spot.Center,
//     selectionObjectName: "SHAPE",
//     resizable: false,
//     resizeObjectName: "SHAPE", // name of the graph object to be resized
//     rotatable: true,
//     rotateObjectName: "SHAPE", // name of the graph object to be rotate
//     rotationSpot: go.Spot.Center,
//   },
//   new go.Binding("location", "loc", go.Point.parse).makeTwoWay(
//     go.Point.stringify
//   ),
//   new go.Binding("rotationSpot", "rotSpot", go.Spot.parse).makeTwoWay(
//     go.Spot.stringify
//   ),
//   $(
//     go.Shape,
//     "RoundedRectangle",
//     { name: "SHAPE", fill: "orange", strokeWidth: 2 },
//     new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(
//       go.Size.stringify
//     ),
//     new go.Binding("angle").makeTwoWay()
//   ),
//   $(go.TextBlock, new go.Binding("text"))
// );
