import go from 'gojs';

export function createDefaultNodeTemplate(clickHandler?: (e: go.InputEvent, thisObj: go.GraphObject) => void): go.Node {
	const $ = go.GraphObject.make;

	return $(
		go.Node,
		'Auto',
		{
			mouseEnter: (e: any, obj: any) => {
				const { stroke, fill, text } = obj.diagram?.model.modelData.uiTheme.node.hover;

				const shape = obj.part.findObject('SHAPE');
				const textBlock = obj.part.findObject('TEXT');

				if (!shape || !textBlock) return;

				shape.stroke = stroke;
				shape.fill = fill;
				textBlock.stroke = text;
			},
			mouseLeave: (e: any, obj: any) => {
				const { stroke, fill, text } = obj.diagram?.model.modelData.uiTheme.node;

				const shape = obj.part.findObject('SHAPE');
				const textBlock = obj.part.findObject('TEXT');
				// const shape = obj.part.findObject("SHAPE")

				if (!shape || !textBlock) return;

				shape.stroke = stroke;
				shape.fill = fill;
				textBlock.stroke = text;
			},
		},
		new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
		$(
			go.Shape,
			{
				name: 'SHAPE',
				fill: 'lightgreen',
				// filter: 'invert(100%)',
			},
			new go.Binding('fill', 'uiTheme', ({ node }) => node.fill).ofModel(), // meaning a property of Model.modelData
			new go.Binding('figure', 'shape'),
			new go.Binding('stroke', 'highlightStrokeColor', (v) => v ?? 'black'),
			new go.Binding('strokeWidth', 'highlightStrokeColor', (v) => (v ? 3 : 1)),
			new go.AnimationTrigger('stroke'),
			new go.AnimationTrigger('fill'),
			new go.AnimationTrigger('strokeWidth')
		),
		$(
			go.TextBlock,
			{
				margin: 8,
				name: 'TEXT',
				editable: true,
			},
			new go.Binding('text', 'label').makeTwoWay(),
			new go.Binding('stroke', 'uiTheme', ({ node }) => node.text).ofModel(), // meaning a property of Model.modelData
			new go.AnimationTrigger('stroke')
		),
		new go.Binding('fromSpot', 'setPortDirection', (v) => (v ? go.Spot.BottomSide : go.Spot.None)).makeTwoWay(),
		new go.Binding('toSpot', 'setPortDirection', (v) => (v ? go.Spot.TopSide : go.Spot.None)).makeTwoWay(),
		{
			click: clickHandler,
			// fromSpot: go.Spot.BottomSide,
			// toSpot: go.Spot.TopSide,
		}
	);
}
