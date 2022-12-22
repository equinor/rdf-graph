import * as go from 'gojs';
import { GraphSelection } from '../../context/GraphContext';
import { createDefaultLinkTemplate } from './templates/default-link-template';
import { createDefaultNodeTemplate } from './templates/default-node-template';

const clickHandler = (_e: go.InputEvent, _thisObj: go.GraphObject) => {
	// console.log('Node clicked!');
	// if (_thisObj instanceof go.Node) {
	// 	console.log(_thisObj.data.id);
	// }
};

const symbolNodeClickHandler = (_e: go.InputEvent, _thisObj: go.GraphObject) => {
	console.log('Engineering Symbol node clicked!');
};

export function defaultInitDiagram() {
	const d = new go.Diagram(undefined, {
		contentAlignment: go.Spot.Center,
		padding: 30,
		model: new go.GraphLinksModel(undefined, undefined, {
			nodeKeyProperty: 'id',
			linkKeyProperty: 'id',
			linkFromPortIdProperty: 'fromPort',
			linkToPortIdProperty: 'toPort',
		}),
		layout: new go.ForceDirectedLayout(),
		nodeTemplateMap: new go.Map<string, go.Part>().add('', createDefaultNodeTemplate(clickHandler)),
		// 	.add(NodeUiCategory.ConnectorSymbol, createSymbolNodeTemplate(symbolNodeClickHandler)),
		linkTemplateMap: new go.Map<string, go.Link>().add('', createDefaultLinkTemplate()),
		// groupTemplate: createDefaultGroupTemplate(),
	});

	d.toolManager.rotatingTool.snapAngleMultiple = 45;
	d.toolManager.rotatingTool.snapAngleEpsilon = 22.5;
	d.model.modelData.portSize = 3;
	d.model.modelData.portOpacity = 0.0;

	return d;
}
