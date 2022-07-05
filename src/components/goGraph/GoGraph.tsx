import go, { Diagram } from 'gojs';
import { ReactDiagram } from 'gojs-react';
import { GraphStateProps } from '../state/GraphStateProps';
import { useEffect, useRef } from 'react';
import { linkTemplateMap } from './link-templates/link-template-map';
import { createDefaultNodeTemplate } from './node-templates/default-node-template';
import { createSymbolNodeTemplate } from './node-templates/symbol-node-template';
import { applyPatch } from './applyPatch';
import { NodeUiType } from './types';
//import { UiNegotiator } from './ui-negotiator/uiNegotiator';
//import { GoJsPatchHandler } from './ui-negotiator/goPatchHandler';

function initDiagram() {
	const $ = go.GraphObject.make;
	// set your license key here before creating the diagram: go.Diagram.licenseKey = "...";
	const d = $(go.Diagram, {
		'undoManager.isEnabled': true,
		// 'undoManager.maxHistoryLength': 0,  // uncomment disable undo/redo functionality
		'clickCreatingTool.archetypeNodeData': {
			text: 'new node',
			color: 'lightblue',
		},
		model: $(go.GraphLinksModel, {
			nodeKeyProperty: 'id',
			linkKeyProperty: 'id',
			linkFromPortIdProperty: 'fromPort',
			linkToPortIdProperty: 'toPort',
		}),
	});

	d.toolManager.rotatingTool.snapAngleMultiple = 45;
	d.toolManager.rotatingTool.snapAngleEpsilon = 22.5;
	d.model.modelData.portSize = 6;

	d.nodeTemplateMap = new go.Map<string, go.Part>()
		.add(NodeUiType.Default, createDefaultNodeTemplate(clickHandler))
		.add(NodeUiType.SvgSymbol, createSymbolNodeTemplate(symbolNodeClickHandler));

	d.linkTemplateMap = linkTemplateMap;

	d.addDiagramListener('BackgroundSingleClicked', function (e) {
		console.log('Background clicked:', { e });
	});

	d.addDiagramListener('ChangedSelection', function (part) {
		console.log('Changed selection:', { part });
	});

	d.layout = new go.ForceDirectedLayout();

	return d;
}

const clickHandler = (e: go.InputEvent, thisObj: go.GraphObject) => {
	console.log('Node clicked!');
	console.log({ e });
	console.log(thisObj);
};

const symbolNodeClickHandler = (e: go.InputEvent, thisObj: go.GraphObject) => {
	console.log('Symbol Node clicked!');
	console.log({ e });
	console.log(thisObj.name);
};

export const GoGraph = ({ graphState, graphPatch }: GraphStateProps) => {
	const diagramRef = useRef<Diagram>(initDiagram());

	//const uiNegotiator = useRef<UiNegotiator>(new UiNegotiator(new GoJsPatchHandler(diagramRef.current)));

	useEffect(() => {
		//uiNegotiator.current.applyPatch(graphPatch);
		applyPatch(diagramRef.current, graphPatch);
	}, [graphPatch]);

	return (
		<>
			<ReactDiagram
				style={{ height: '1000px', width: '1000px' }}
				initDiagram={() => diagramRef.current}
				divClassName="graph-links-model"
				nodeDataArray={[]}
				linkDataArray={[]}
				// onModelChange={handleModelChange}
			/>
		</>
	);
};
