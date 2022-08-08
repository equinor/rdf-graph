import go, { GraphObject } from 'gojs';
import { getSymbolDataURI } from '../../../symbol-api';
import { stringToSvgElement } from '../../../symbol-api/svg-manipulation';
import { itemTemplateMap } from '../item-templates/item-templates-map';
import { createDefaultItemTemplate, createPositionPortItemTemplate } from '../item-templates/position-port-item-template';
import { UiTheme } from '../style/colors';
import { NodeUiItemCategory, SymbolNodeData } from '../types';

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
			.bind(new go.Binding('uiTheme').ofModel())
			.add(
				new go.Shape('Rectangle', {
					isPanelMain: true,
					fill: 'transparent',
					strokeWidth: 0,
				})
			)
			// TOP TEXT
			.add(
				new go.TextBlock('', {
					alignment: go.Spot.TopCenter,
					alignmentFocus: go.Spot.TopCenter,
				})
					.bind(new go.Binding('text', 'key').ofObject())
					.bind(new go.Binding('angle', 'angle', (a) => -a).ofObject())
					.bind(
						new go.Binding('alignment', 'angle', (a: number) => {
							return getTopLabelAlignment(a);
						}).ofObject()
					)
					.bind(
						new go.Binding('alignmentFocus', 'angle', (a: number) => {
							return getTopLabelAlignment(a);
						}).ofObject()
					)
					.bind(new go.Binding('text', 'label'))
			)
			.add(
				new go.Panel(go.Panel.Position, { margin: 10 })
					.add(
						new go.Picture({
							background: 'transparent',
						})
							.bind('source', 'symbolId', (id, d) => {
								const data = d.part.data as SymbolNodeData;

								return getSymbolDataURI(id);
							})
							.bind('width')
							.bind('height')
							.bind(
								new go.Binding('source', 'uiTheme', (theme: UiTheme, d) => {
									const data = d.part.data as SymbolNodeData;
									const fill = theme.node.fill == null ? 'transparent' : theme.node.fill;
									const dataU = getSymbolDataURI(data.symbolId!, { fill: fill, stroke: theme.node.stroke });
									return dataU;
								}).ofObject()
							)
					)
					.add(
						// CONNECTOR PANEL
						new go.Panel(go.Panel.Position, {
							// itemTemplateMap: itemTemplateMap,
							// itemCategoryProperty: 'category',
							// itemCategoryProperty: d => {
							// 	return d.category
							// },
							// itemCategoryProperty: 'category',
							// itemTemplateMap : new go.Map<string, go.Panel>().add('', createDefaultItemTemplate()).add(NodeUiItemCategory.PositionPort, createPositionPortItemTemplate())
							itemTemplate: createPositionPortItemTemplate(),
						})
							.bind('itemArray', 'ports')
							.bind('width')
							.bind('height')
					)
					.bind(new go.Binding('angle').makeTwoWay())
					.bind(new go.Binding('scale').makeTwoWay())
					.bind(new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify))
			)
	);
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
