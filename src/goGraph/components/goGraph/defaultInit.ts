import go from 'gojs';
import { getDefaultLayoutConfig, getLayout, GoGraphLayout } from '../../layout';
import { linkTemplateMap } from '../../link-templates/link-template-map';
import { createDefaultNodeTemplate, createSymbolNodeTemplate } from '../../node-templates';
import { NodeUiCategory } from '../../types';

const clickHandler = (_e: go.InputEvent, _thisObj: go.GraphObject) => {};

const symbolNodeClickHandler = (_e: go.InputEvent, _thisObj: go.GraphObject) => {};

export function defaultInitDiagram() {
	const $ = go.GraphObject.make;
	const d = $(go.Diagram, {
		contentAlignment: go.Spot.Center,
		padding: 30,
		'undoManager.isEnabled': true,
		model: $(go.GraphLinksModel, {
			nodeKeyProperty: 'id',
			linkKeyProperty: 'id',
			linkFromPortIdProperty: 'fromPort',
			linkToPortIdProperty: 'toPort',
		}),
	});

	d.toolManager.rotatingTool.snapAngleMultiple = 45;
	d.toolManager.rotatingTool.snapAngleEpsilon = 22.5;
	d.model.modelData.portSize = 3;
	d.model.modelData.portOpacity = 0.0;

	d.nodeTemplateMap = new go.Map<string, go.Part>()
		.add(NodeUiCategory.Default, createDefaultNodeTemplate(clickHandler))
		.add(NodeUiCategory.EngineeringSymbol, createSymbolNodeTemplate(symbolNodeClickHandler));

	d.linkTemplateMap = linkTemplateMap;

	//d.layout = getLayout(getDefaultLayoutConfig(GoGraphLayout.ForceDirected));

	d.layout = new go.ForceDirectedLayout();

	return d;
}
