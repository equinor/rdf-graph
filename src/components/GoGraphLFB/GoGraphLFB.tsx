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

	const connecters = [
		{
			id: 'rct_top_1',
			direction: 'top',
		},
		{
			id: 'rct_top_2',
			direction: 'top',
		},
		{
			id: 'rct_top_3',
			direction: 'top',
		},
		{
			id: 'rct_bt_1',
			direction: 'bottom',
		},
		{
			id: 'rct_bt_2',
			direction: 'bottom',
		},
		{
			id: 'rct_bt_3',
			direction: 'bottom',
		},
		{
			id: 'rct_bt_4',
			direction: 'bottom',
		},
	];

	const connecters2 = [
		{
			id: 'rct_top_1',
			direction: 'top',
		},
		{
			id: 'rct_top_2',
			direction: 'top',
		},
		{
			id: 'rct_top_3',
			direction: 'top',
		},
		{
			id: 'rct_bt_1',
			direction: 'bottom',
		},
		{
			id: 'rct_bt_2',
			direction: 'bottom',
		},
		{
			id: 'rct_bt_3',
			direction: 'bottom',
		},
		{
			id: 'rct_bt_4',
			direction: 'bottom',
		},
		{
			id: 'rct_bt_5',
			direction: 'bottom',
		},
		{
			id: 'rct_bt_6',
			direction: 'bottom',
		},
		{
			id: 'rct_bt_7',
			direction: 'bottom',
		},
		{
			id: 'rct_bt_8',
			direction: 'bottom',
		},
		{
			id: 'rct_bt_9',
			direction: 'bottom',
		},
	];

	const [nodeDataArray, setNodeDataArray] = useState([
		// createSymbolNode(1, 'Pump2'),
		// createSymbolNode(2, 'Valve_gate_o'),
		// createSymbolNode(3, 'Valve_gate_o'),
		createRectangleNode(1, 'ESD2 P/B in OCC', []),
		createRectangleNode(2, 'ESD2 P/B in the field', []),
		createRectangleNode(3, 'ESD2', connecters),
		createRectangleNode(4, 'PSD to PdQ', []),
		createRectangleNode(5, 'PdQ related', []),
		createRectangleNode(6, 'Nozz area input', []),

		createRectangleNode(7, 'ESD3', connecters2),
		createRectangleNode(8, 'ESVs', []),
	]);

	const [linkDataArray, setLinkDataArray] = useState([
		{ key: -1, from: 1, to: 3, fromPort: 'cp1', toPort: 'rct_top_1' },
		{ key: -2, from: 2, to: 3, fromPort: 'cp1', toPort: 'rct_top_3' },
		{ key: -3, from: 2, to: 3, fromPort: 'cp1', toPort: 'rct_top_2' },
		{ key: -4, from: 3, to: 4, fromPort: 'rct_bt_1', toPort: 'cp1' },
		{ key: -5, from: 3, to: 5, fromPort: 'rct_bt_2', toPort: 'cp1' },
		{ key: -6, from: 3, to: 6, fromPort: 'rct_bt_4', toPort: 'cp1' },

		{ key: -7, from: 7, to: 8, fromPort: 'rct_bt_4', toPort: 'cp1' },
		// { key: -8, from: 3, to: 6, fromPort: 'rct_bt_4', toPort: 'cp1' },

		// { key: -2, from: 3, to: 1, fromPort: 'cp2', toPort: 'cp2' },
		// { key: -3, from: 3, to: 4, fromPort: 'cp2', toPort: 'rct_top_1' },
		// { key: -4, from: 3, to: 4, fromPort: 'cp2', toPort: 'rct_top_2' },
		// { key: -5, from: 3, to: 4, fromPort: 'cp2', toPort: 'rct_bt_2' },
		// { key: -6, from: 4, to: 3, fromPort: 'rct_bt_1', toPort: 'cp2' },
	]);

	const clickHandler = (e, obj) => {
		console.log('Node clicked');
		console.log(18, obj.part.findLinksOutOf().count);
		console.log(18, obj.part.findLinksInto().count);
		// obj.part.findLinksOutOf().each(function (n: any) {
		// 	console.log(13, n.part.data);
		// });
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
			layout: $(go.LayeredDigraphLayout, {
				layerSpacing: 40,
				direction: 90,
				layeringOption: go.LayeredDigraphLayout.LayerLongestPathSink,
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
				style={{ height: 'calc(100vh - 70px)', width: '100%' }}
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
