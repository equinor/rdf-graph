import go, { GraphLinksModel } from 'gojs';
import { labelIri, labelKey } from '../../../mapper/predicates';
import { GraphEdge, GraphNode, GraphPatch, GraphPropertyIdentifier } from '../../../models/graphModel';
import { createDefaultNode } from '../node-factory/default-node-factory';
import { createSymbolNode } from '../node-factory/symbol-node-factory';
import { NodeUiType } from '../types';
//import { addAssertion } from './addAssertion';

export function applyPatch(diagram: go.Diagram, graphPatch: GraphPatch) {
	console.log('PATCH¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤', graphPatch);

	diagram.commit((d) => {
		const model = d.model as GraphLinksModel;
		let i = 1;
		for (const patch of graphPatch) {
			console.log('applying patch', i++);
			switch (patch.action) {
				case 'add':
					switch (patch.assertion.type) {
						case 'node':
							addNode(model, patch.assertion);
							break;
						case 'link':
							//addLink(model, patch.assertion);
							break;
						case 'linkNode':
							//debugger;
							break;
						case 'property':
							addProperty(model, patch.assertion);
							//d.model.setDataProperty(a.node, a.key, a.value);
							break;
						default:
							break;
					}
					break;
				case 'remove':
					break;
			}
		}
	});
}

function addNode(model: go.GraphLinksModel, a: GraphNode): void {
	if (a.type === 'linkNode') return;
	debugger;
	model.addNodeData(createDefaultNode(a.id, a.id));
}

function addLink(model: go.GraphLinksModel, ge: GraphEdge): void {
	const { id, source, target } = ge;
	const { [labelIri]: label } = ge.linkRef! || {};
	model.addLinkData({
		id: id,
		from: source,
		to: target,
		[labelKey]: label,
	});
	//debugger;
}

function addProperty(model: go.GraphLinksModel, prop: GraphPropertyIdentifier) {
	var data = model.findNodeDataForKey(prop.node.id);

	if (!data) {
		console.error(`Could not find node with id ${prop.node.id}`);
		console.log('Prop: ', { prop });
		return;
	}

	switch (prop.key) {
		case 'symbol':
			const symData = createSymbolNode('', prop.value.id);

			//debugger;
			model.setCategoryForNodeData(data, NodeUiType.SvgSymbol);
			model.setDataProperty(data, 'symbolId', symData.id);
			model.setDataProperty(data, 'width', symData.width);
			model.setDataProperty(data, 'height', symData.height);
			model.setDataProperty(data, 'svgDataURI', symData.svgDataURI);
			model.setDataProperty(data, 'symbolPorts', symData.symbolPorts);
			const upd = model.findNodeDataForKey(prop.node.id);
			console.log({ upd });
			//debugger;
			// node.data(nodeTypeKey, NodeType.SymbolContainer);
			// node.data(prop.key, prop.value);
			break;
		// case 'relativePosition':
		// 	node.data(nodeTypeKey, NodeType.SymbolConnector);
		// 	node.data(prop.key, prop.value);
		// 	break;
		// case 'parent':
		// 	node.move({ parent: prop.node.parent!.id });
		// 	break;
		default:
		//model.setDataProperty(data, prop.key, prop.value);
	}
}
