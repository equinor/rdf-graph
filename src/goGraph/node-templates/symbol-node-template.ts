import go from 'gojs';
import { portDirectionToSpot } from '../item-templates/position-port-item-template';

export function createSymbolNodeTemplate(clickHandler?: ((e: go.InputEvent, thisObj: go.GraphObject) => void) | null): go.Node {
	const $ = go.GraphObject.make;
	const nodePadding = 10;

	return (
		new go.Node(go.Panel.Position, {
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
			.bind('width', 'symbolWidth', (w) => w + nodePadding * 2)
			.bind('height', 'symbolHeight', (h) => h + nodePadding * 2)
			// SYMBOL
			.add(
				new go.Panel(go.Panel.Auto, { margin: 0, background: 'transparent', position: new go.Point(nodePadding, nodePadding) })
					// GEOMETRY (single path)
					.add(
						new go.Shape({
							name: 'GEOMETRY',
							strokeWidth: 1,
						})
							.bind('geometryString', 'symbolGeometry', (v) => `F ${v}`)
							.bind(new go.Binding('fill', 'uiTheme', ({ symbol }) => symbol.fill).ofModel())
							.bind(new go.Binding('stroke', 'uiTheme', ({ symbol }) => symbol.stroke).ofModel())
					)
			)
			// CONNECTOR PANEL
			.add(
				new go.Panel(go.Panel.Position, {
					itemTemplate: $(
						go.Panel,
						'Position',
						$(
							go.Shape,
							'Circle',
							{
								name: 'CONNECTOR',
								fill: 'blue',
								strokeWidth: 0,
								opacity: 0.6,
								fromEndSegmentLength: 50,
								toEndSegmentLength: 50,
							},
							new go.Binding('portId'),
							new go.Binding('position', 'relativePosition'),
							new go.Binding('fromSpot', 'direction', portDirectionToSpot),
							new go.Binding('toSpot', 'direction', portDirectionToSpot),
							new go.Binding('height', 'portSize').ofModel(),
							new go.Binding('width', 'portSize').ofModel()
						)
					),
				})
					.bind('itemArray', 'ports')
					.bind(
						new go.Binding('position', 'portSize', (size) => {
							return new go.Point(nodePadding - (size / 2 + 0.5), nodePadding - (size / 2 + 0.5));
						}).ofModel()
					)
			)
	);
}
