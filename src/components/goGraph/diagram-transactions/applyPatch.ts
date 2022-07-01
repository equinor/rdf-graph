import go, { GraphLinksModel } from 'gojs';
import { hasConnectorIri, labelIri, labelKey } from '../../../mapper/predicates';
import { GraphEdge, GraphNode, GraphPatch, GraphPropertyIdentifier } from '../../../models/graphModel';
import { createDefaultNode } from '../node-factory/default-node-factory';
import { createSymbolNode } from '../node-factory/symbol-node-factory';
import { NodeUiType, SymbolNodeData, SymbolNodePort } from '../types';
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
							//debugger;
							addNode(model, patch.assertion);
							break;
						case 'link':
							break;
						case 'linkNode':
							addLink(model, patch.assertion);
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
	if (a.type === 'linkNode' || a.connectorName) return;
	//debugger;
	model.addNodeData(createDefaultNode(a.id, a.id));
}

function addLink_OLD(model: go.GraphLinksModel, ge: GraphEdge): void {
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

function addLink(model: go.GraphLinksModel, ge: GraphNode): void {
	const { id, source, target } = ge;
	const { [labelIri]: label } = ge.linkRef! || {};
	//debugger;
	//if(ge.id !== hasConnectorIri) return;

	if (ge.id === hasConnectorIri) return;

	for (const link of ge.links) {
		const srcParent = link.sourceRef?.parent?.id;
		const trgParent = link.targetRef?.parent?.id;

		const newLink = {
			id: link.id,
			from: srcParent ?? link.source,
			fromPort: srcParent ? link.source : '',
			to: trgParent ?? link.target,
			toPort: trgParent ? link.target : '',
			[labelKey]: label,
		};

		model.addLinkData(newLink);
		//debugger;
	}

	//debugger;
}

function addProperty(model: go.GraphLinksModel, prop: GraphPropertyIdentifier) {
	const ignoredProps = ['relativePosition', 'parent'];
	if (ignoredProps.includes(prop.key)) {
		console.log('Ignored prop:', prop.key);
		console.log('prop:', { prop });
		return;
	}
	// var data = model.findNodeDataForKey(prop.node.id);

	// if (!data) {
	// 	console.error(`Could not find node with id ${prop.node.id}`);
	// 	console.log('Prop: ', { prop });
	// 	return;
	// }

	switch (prop.key) {
		case 'symbol':
			const data = model.findNodeDataForKey(prop.node.id);
			if (!data) return;

			const symData = createSymbolNode('', prop.value.id);

			// Map symbol port name to port id
			const rdfPorts = prop.node.connector;
			if (rdfPorts) {
				for (const p of symData.symbolPorts) {
					const portObj = rdfPorts.find((po) => p.name === po.connectorName);
					if (portObj) {
						p.portId = portObj.id;
					}
				}
			}

			//debugger;
			model.setCategoryForNodeData(data, NodeUiType.SvgSymbol);
			model.setDataProperty(data, 'symbolId', symData.id);
			model.setDataProperty(data, 'width', symData.width);
			model.setDataProperty(data, 'height', symData.height);
			model.setDataProperty(data, 'svgDataURI', symData.svgDataURI);
			model.setDataProperty(data, 'symbolPorts', symData.symbolPorts);

			break;
		case 'connectorName':
			// Dont work because link patch arrives before this stuff... :/
			// const symbolNodeId = prop.node.parent?.id;
			// const symDataObj = model.findNodeDataForKey(symbolNodeId) as SymbolNodeData;
			// if (!symDataObj) return;

			// for (const p of symDataObj.symbolPorts) {
			// 	if (p.name === prop.value) {
			// 		p.portId = prop.node.id;
			// 		break;
			// 	}
			// }

			// model.setDataProperty(symDataObj, 'symbolPorts', symDataObj.symbolPorts);
			// debugger;
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
