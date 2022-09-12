import go from 'gojs';
import { portDirectionToSpot } from '../item-templates/position-port-item-template';

// this is shown by the mouseHover event handler
var nodeHoverMenu = new go.Adornment('Spot', {
	mouseLeave: (e, obj) => {
		const ad = obj.part as go.Adornment;
		if (!ad.adornedPart) return;
		ad.adornedPart.removeAdornment('nodeHoverMenu');
	},
})
	.add(
		new go.Placeholder({
			isActionable: true,
			click: (e, obj) => {
				var node = (obj.part as go.Adornment).adornedPart;
				node?.diagram?.select(node);
			},
		})
	)
	.add(
		new go.Panel('Auto', { alignment: go.Spot.Right, alignmentFocus: go.Spot.Left, background: 'transparent', padding: 10 })
			.add(
				new go.Panel('Vertical', { padding: 10 })
					.bind(
						new go.Binding('background', 'uiTheme', ({ menu }) => {
							return menu.background;
						}).ofModel()
					)
					.add(
						new go.TextBlock('<no-label>', { font: 'bold 16px sans-serif', alignment: go.Spot.Left, margin: new go.Margin(0, 0, 8, 0) })
							.bind('text', 'label')
							.bind(
								new go.Binding('stroke', 'uiTheme', ({ menu }) => {
									return menu.text;
								}).ofModel()
							)
					)
					.add(
						new go.TextBlock('Some cool info!', { alignment: go.Spot.Left, margin: new go.Margin(0, 0, 5, 0) }).bind(
							new go.Binding('stroke', 'uiTheme', ({ menu }) => {
								return menu.text;
							}).ofModel()
						)
					)
					.add(
						new go.TextBlock('Mystery link', { alignment: go.Spot.Left }).bind(
							new go.Binding('stroke', 'uiTheme', ({ menu }) => {
								return menu.text;
							}).ofModel()
						)
					)
			)
			.bind(new go.Binding('angle', 'angle', (a) => -a).ofObject())
	);

export function createSymbolNodeTemplate(clickHandler?: ((e: go.InputEvent, thisObj: go.GraphObject) => void) | null): go.Node {
	const $ = go.GraphObject.make;
	const nodePadding = 16;
	// Port diameter
	const dPort = 0.1;
	return (
		new go.Node(go.Panel.Auto, {
			name: 'NODE',
			background: 'transparent',
			resizable: false,
			click: clickHandler,
			rotatable: true,
			rotationSpot: go.Spot.Center,
			selectable: true,
			selectionAdorned: true,
			scale: 1,
			mouseOver: (_e, obj) => {
				var node = obj.part;
				if (!node) return;
				nodeHoverMenu.adornedObject = node;
				node.addAdornment('nodeHoverMenu', nodeHoverMenu);
			},
			mouseEnter: (_e: any, obj: any) => {
				const { stroke, text } = obj.diagram?.model.modelData.uiTheme.symbol.hover;

				const shape = obj.part.findObject('GEOMETRY');
				const label = obj.part.findObject('LABEL');

				if (shape) shape.stroke = stroke;
				if (label) label.stroke = text;
			},
			mouseLeave: (_e: any, obj: any) => {
				const { stroke, text } = obj.diagram?.model.modelData.uiTheme.symbol;

				const shape = obj.part.findObject('GEOMETRY');
				const label = obj.part.findObject('LABEL');

				if (obj.part.isSelected) return;

				if (shape) shape.stroke = stroke;
				if (label) label.stroke = text;
			},
			selectionAdornmentTemplate: $(
				go.Adornment,
				'Spot',
				$(
					go.Panel,
					'Auto',
					//{ padding: 10 },
					// this Adornment has a rectangular blue Shape around the selected node
					$(go.Shape, 'RoundedRectangle', {
						fill: null,
						stroke: 'dodgerblue',
						strokeWidth: 2,
						strokeDashArray: [5, 5],
						strokeCap: 'round',
					}),
					$(go.Placeholder)
				)
				//$(go.TextBlock, '', { alignment: go.Spot.Top, alignmentFocus: go.Spot.Bottom, background: 'white' }).bind('text', 'label')
			), // end Adornment
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
			//
			.add(
				new go.Panel(go.Panel.Spot, {
					//background: 'blue',
					alignment: go.Spot.Center,
				})
					.bind('width', 'symbolWidth', (w) => w + nodePadding * 2)
					.bind('height', 'symbolHeight', (h) => h + nodePadding * 2)
			)
			// TOP LABEL
			.add(
				new go.Panel(go.Panel.Auto, {
					//background: 'blue',
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
					)
					.bind(new go.Binding('angle', 'angle', (a) => -a).ofObject())
			)
			// Symbol and connector position panel
			.add(
				new go.Panel(go.Panel.Position, {
					alignment: go.Spot.Center,
				}) // SYMBOL
					.add(
						new go.Panel(go.Panel.Auto, { margin: 0, background: 'transparent', position: new go.Point(0, 0) })
							// GEOMETRY (single path)
							.add(
								new go.Shape({
									name: 'GEOMETRY',
									strokeWidth: 1,
								})
									.bind('geometryString', 'symbolGeometry', (v) => `F ${v}`)
									.bind(
										new go.Binding('fill', 'uiTheme', ({ symbol }, obj) => {
											const node = obj.part.findObject('NODE');
											if (node && node.isSelected) return symbol.hover.fill;
											return symbol.fill;
										}).ofModel()
									)
									.bind(
										new go.Binding('stroke', 'uiTheme', ({ symbol }, obj) => {
											const node = obj.part.findObject('NODE');
											if (node && node.isSelected) return symbol.hover.text;
											return symbol.stroke;
										}).ofModel()
									)

									.bind(
										new go.Binding('stroke', 'isSelected', (v, targetObj) => {
											const theme = targetObj.diagram.model.modelData.uiTheme;
											return v ? theme.symbol.hover.stroke : theme.symbol.stroke;
										}).ofObject('')
									)
							)
					)
					// CONNECTOR PANEL (PORT MAPPING, invisible...)
					.add(
						new go.Panel(go.Panel.Position, {
							position: new go.Point(-(dPort / 2 + 0.5), -(dPort / 2 + 0.5)),
							itemTemplate: $(
								go.Panel,
								'Position',
								$(
									go.Shape,
									'Circle',
									{
										name: 'CONNECTOR',
										fill: 'red',
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
						}).bind('itemArray', 'ports')
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
										//fill: 'blue',
										strokeWidth: 0,
										opacity: 1,
										fromEndSegmentLength: 50,
										toEndSegmentLength: 50,
									},
									new go.Binding('position', 'relativePosition'),
									new go.Binding('height', 'portSize').ofModel(),
									new go.Binding('width', 'portSize').ofModel(),
									new go.Binding('fill', 'uiTheme', ({ symbol }) => symbol.stroke).ofModel(),
									new go.Binding('opacity', 'portOpacity').ofModel()
								)
							),
						})
							.bind('itemArray', 'ports')
							.bind(
								new go.Binding('position', 'portSize', (size) => {
									return new go.Point(0 - (size / 2 + 0.5), 0 - (size / 2 + 0.5));
								}).ofModel()
							)
					)
			)
	);
}
