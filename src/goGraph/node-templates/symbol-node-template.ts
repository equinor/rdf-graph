import go, { GraphObject } from 'gojs';
import { portDirectionToSpot } from '../item-templates/position-port-item-template';

export function createSymbolNodeTemplate(clickHandler?: ((e: go.InputEvent, thisObj: go.GraphObject) => void) | null): go.Node {
	const $ = go.GraphObject.make;
	const nodePadding = 24;
	// Port diameter
	const dPort = 0.1;
	return (
		new go.Node(go.Panel.Spot, {
			name: 'NODE',
			background: 'transparent',
			resizable: false,
			click: clickHandler,
			rotatable: true,
			rotationSpot: go.Spot.Center,
			selectable: true,
		})
			// MARGIN PANEL
			.add(
				new go.Panel(go.Panel.Spot, {
					alignment: go.Spot.Center,
				})
					.bind('width', 'symbolWidth', (w) => w + nodePadding * 2)
					.bind('height', 'symbolHeight', (h) => h + nodePadding * 2)
			)

			// TOP LABEL
			.add(
				new go.Panel(go.Panel.Auto, {
					alignment: go.Spot.Top,
					alignmentFocus: go.Spot.Top,
				})
					.add(
						new go.TextBlock({ name: 'LABEL' })
							.bind('text', 'label')
							.bind(
								new go.Binding('stroke', 'uiTheme', ({ symbol }, obj) => {
									const node = obj.part.findObject('NODE');
									if (node && node.isSelected) return symbol.hover.text;
									return symbol.text;
								}).ofModel()
							)
							.bind(
								new go.Binding('stroke', 'isSelected', (v, targetObj) => {
									const theme = targetObj.diagram.model.modelData.uiTheme;
									return v ? theme.symbol.hover.text : theme.symbol.text;
								}).ofObject('')
							)
							.trigger(new go.AnimationTrigger('stroke', { duration: 150 }))
					)
					.bind(new go.Binding('angle', 'angle', (a) => -a).ofObject())
			)

			// GEOMETRY (single path)
			.add(
				new go.Panel(go.Panel.Spot, {
					alignment: go.Spot.Center,
				})
					.bind('width', 'symbolWidth')
					.bind('height', 'symbolHeight')
					.add(
						new go.Panel(go.Panel.Position, {
							alignment: go.Spot.Center,
						}).add(
							new go.Shape({
								name: 'GEOMETRY',
								strokeWidth: 0,
								stroke: 'transparent',
								geometryStretch: GraphObject.None,
							})
								.bind('geometryString', 'symbolGeometry', (v) => `F ${v}`)
								.bind('fill', 'color')
						)
					)
			)

			// CONNECTOR PANEL (PORT MAPPING, invisible...)
			.add(
				new go.Panel(go.Panel.Position, {
					alignment: new go.Spot(0.5, 0.5, -(dPort / 2), -(dPort / 2)),
					itemTemplate: $(
						go.Panel,
						'Position',
						$(
							go.Shape,
							'Circle',
							{
								name: 'CONNECTOR',
								fill: 'transparent',
								strokeWidth: 0,
								opacity: 0,
								fromEndSegmentLength: 50,
								toEndSegmentLength: 50,
								width: dPort,
								height: dPort,
							},
							new go.Binding('portId'),
							new go.Binding('position', 'relativePosition'),
							new go.Binding('fromSpot', 'direction', portDirectionToSpot),
							new go.Binding('toSpot', 'direction', portDirectionToSpot)
						)
					),
				})
					.bind('itemArray', 'ports')
					.bind('width', 'symbolWidth')
					.bind('height', 'symbolHeight')
			)

			// CONNECTOR PANEL (VISUAL PORTS)
			.add(
				new go.Panel(go.Panel.Position, {
					itemTemplate: $(
						go.Panel,
						'Position',
						$(
							go.Shape,
							'Circle',
							{
								name: 'CONNECTOR-VISUAL',
								fill: 'red',
								strokeWidth: 0,
								opacity: 1,
								fromEndSegmentLength: 50,
								toEndSegmentLength: 50,
							},
							new go.Binding('position', 'relativePosition'),
							new go.Binding('height', 'portSize').ofModel(),
							new go.Binding('width', 'portSize').ofModel(),
							new go.Binding('opacity', 'portOpacity').ofModel()
						)
					),
				})
					.bind('itemArray', 'ports')
					.bind('width', 'symbolWidth')
					.bind('height', 'symbolHeight')
					.bind(new go.Binding('alignment', 'portSize', (size) => new go.Spot(0.5, 0.5, -(size / 2), -(size / 2))).ofModel())
			)
	);
}
