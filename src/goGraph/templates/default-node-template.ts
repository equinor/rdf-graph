import * as go from 'gojs';
const $ = go.GraphObject.make;
export function createDefaultNodeTemplate(
	clickHandler?: (e: go.InputEvent, thisObj: go.GraphObject) => void
): go.Node {
	return new go.Node(go.Panel.Auto, {
		resizable: false,
		click: clickHandler,
		toolTip:  // define a tooltip for each node that displays the color as text
        $("ToolTip",
          $(go.TextBlock, { margin: 4 },
            new go.Binding("text", "http://www.w3.org/2000/01/rdf-schema#description"))
        )  // end of Adornment
	})
		.add(
			new go.Shape({
				fill: 'lightgreen',
				figure: 'RoundedRectangle',
			})
				.bind('figure', 'shape', (v) => (v ? v : 'RoundedRectangle'))
				.bind('fill', 'color')
		)
		.add(
			new go.TextBlock('<NoLabel>', {
				margin: 8,
				wrap: go.TextBlock.OverflowEllipsis,
			}).bind('text', 'label')
		); 
}
