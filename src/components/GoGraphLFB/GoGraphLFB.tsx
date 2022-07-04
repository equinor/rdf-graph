import go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import { useState } from 'react';
import { linkTemplateMap } from './link-templates/link-template-map';
import { createSymbolNode, createRectangleNode } from './node-factory/symbol-node-factory';
import { createDefaultNodeTemplate } from './node-templates/default-node-template';
import { createRCTNodeTemplate } from './node-templates/rct-templates-template';
import { createSymbolNodeTemplate } from './node-templates/symbol-node-template';

export const GoGraphLFB = () => {
	const [diagram, setDiagram] = useState<go.Diagram>();

	const [nodeDataArray, setNodeDataArray] = useState([
		// createSymbolNode(1, 'Pump2'),
		// createSymbolNode(2, 'Valve_gate_o'),
		createSymbolNode(3, 'Valve_gate_o'),
		createRectangleNode(4, 10, 'Hello World'),
	]);

	const [linkDataArray, setLinkDataArray] = useState([
		{ key: -1, from: 1, to: 2, fromPort: 'cp1', toPort: 'cp1' },
		{ key: -2, from: 3, to: 1, fromPort: 'cp2', toPort: 'cp2' },
		{ key: -3, from: 4, to: 3, fromPort: 'rct5', toPort: 'cp2' },
	]);

	const clickHandler = () => {
		console.log('Node clicked');
	};

	const symbolNodeClickHandler = (e: go.InputEvent, thisObj: go.GraphObject) => {
		console.log('Symbol Node clicked!');
		console.log({ e });
		console.log(thisObj.name);
	};

	function initDiagram() {
		const $ = go.GraphObject.make;

		const d = $(go.Diagram, {
			'undoManager.isEnabled': true,
			'clickCreatingTool.archetypeNodeData': {
				text: 'new node',
				color: 'lightblue',
			},
			model: $(go.GraphLinksModel, {
				linkKeyProperty: 'key',
				linkFromPortIdProperty: 'fromPort',
				linkToPortIdProperty: 'toPort',
			}),
		});

		d.toolManager.rotatingTool.snapAngleMultiple = 45;
		d.toolManager.rotatingTool.snapAngleEpsilon = 22.5;
		d.model.modelData.portSize = 1;

		d.nodeTemplateMap = new go.Map<string, go.Part>()
			.add('', createDefaultNodeTemplate(clickHandler))
			.add('symbolWithPorts', createSymbolNodeTemplate(symbolNodeClickHandler))
			.add('rctNode', createRCTNodeTemplate(clickHandler));

		d.linkTemplateMap = linkTemplateMap;

		d.addDiagramListener('BackgroundSingleClicked', function (e) {
			console.log('Background clicked');
		});

		d.addDiagramListener('ChangedSelection', function (part) {
			console.log('Changed selection');
		});

		d.layout = new go.ForceDirectedLayout();

		setDiagram(d);

		return d;
	}

	function handleModelChange(changes: go.IncrementalData) {
		console.log('GoJS model changed!');
		console.log({ changes });
	}

	function zoomToFit() {
		diagram?.zoomToFit();
	}

	function rotate() {
		if (!diagram) return;

		diagram.selection.toArray().forEach((v) => {
			console.log('Selected:', v.data.key);
			v.data.angle = v.data.angle + 45;
		});
	}

	return (
		<div>
			<ReactDiagram
				style={{ height: '1000px', width: '1000px' }}
				initDiagram={initDiagram}
				divClassName="diagram-component"
				nodeDataArray={nodeDataArray}
				linkDataArray={linkDataArray}
				onModelChange={handleModelChange}
			/>
			<button onClick={zoomToFit}>ZoomToFit</button>
			<button onClick={rotate}>Rotate</button>
		</div>
	);
};
