import go, { GraphLinksModel } from 'gojs';
import { GraphEdge, GraphNode, GraphPatch, GraphPropertyIdentifier } from '../../models/graphModel';
import { propMap, shapeMap } from './mapper/patchDataMaps';
import { createDefaultNodeData } from './node-data-factory/default-node-factory';
import { createSymbolNodeData } from './node-data-factory/symbol-node-factory';
import { NodeUiType, SymbolNodeData } from './types';

//     _    _  ___  ______ _   _ _____ _   _ _____    _ _
//     | |  | |/ _ \ | ___ \ \ | |_   _| \ | |  __ \  | | |
//     | |  | / /_\ \| |_/ /  \| | | | |  \| | |  \/  | | |
//     | |/\| |  _  ||    /| . ` | | | | . ` | | __   | | |
//     \  /\  / | | || |\ \| |\  |_| |_| |\  | |_\ \  |_|_|
//      \/  \/\_| |_/\_| \_\_| \_/\___/\_| \_/\____/  (_|_)
//
// 			WIP... Connectors don't work before Eirik has added new "connector" and "edge" assertions!

export function applyPatch(diagram: go.Diagram, graphPatch: GraphPatch) {
	console.log('PATCH:', { graphPatch });

	diagram.commit((d) => {
		const model = d.model as GraphLinksModel;
		let i = 1;
		for (const a of graphPatch) {
			console.log(`applying patch ${i++} action = ${a.action}  , type = ${a.assertion.type}`);
			switch (a.action) {
				case 'add':
					switch (a.assertion.type) {
						case 'node':
							//debugger;
							addNode(model, a.assertion);
							break;
						case 'link':
							addLink(model, a.assertion);
							break;
						//case 'linkNode':
						//addLink(model, patch.assertion);
						//	break;
						case 'property':
							addProperty(model, a.assertion);
							//d.model.setDataProperty(a.node, a.key, a.value);
							break;
						default:
							break;
					}
					break;
				case 'remove':
					switch (a.assertion.type) {
						case 'property':
							break;

						default:
							break;
					}
					//debugger;
					break;
			}
		}
	});
}

function addNode(model: go.GraphLinksModel, a: GraphNode): void {
	model.addNodeData(createDefaultNodeData(a.id));
}

function addLink(model: go.GraphLinksModel, ge: GraphEdge): void {
	model.addLinkData({
		id: ge.id,
		from: ge.source,
		//fromPort: srcParent?.id ? link.source : '',
		to: ge.target,
		//toPort: trgParent?.id ? link.target : '',
		label: ge.linkRef?.label ?? '',
	});
}

function addProperty(model: go.GraphLinksModel, prop: GraphPropertyIdentifier) {
	const ignoredProps = ['relativePosition', 'parent'];
	if (ignoredProps.includes(prop.key)) {
		console.log('Ignored prop:', prop.key);
		console.log('Ignored prop obj:', { prop });
		return;
	}

	console.log(prop.key);

	switch (prop.key) {
		case 'symbol':
			addSymbolProp(model, prop);
			break;
		case 'connectorName':
			// Dont work because link patch arrives before this stuff... :/
			const symbolNodeId = prop.node.parent?.id;
			let symDataObj = model.findNodeDataForKey(symbolNodeId) as SymbolNodeData;

			//addNodeIfNotExists(model, symDataObj.id);
			if (!symDataObj) {
				//debugger;
				// Create symbol node
				addNode(model, prop.node);
				//debugger;
				symDataObj = model.findNodeDataForKey(symbolNodeId) as SymbolNodeData;
			}

			for (const p of symDataObj.symbolPorts) {
				if (p.name === prop.value) {
					p.portId = prop.node.id;
					//debugger;
					break;
				}
			}
			//debugger;
			model.setDataProperty(symDataObj, 'symbolPorts', symDataObj.symbolPorts);
			//debugger;
			break;
		case 'shape':
			setMappedProp(model, prop, (p: string) => shapeMap[p]);
			//setNodeShape(model, prop);
			break;
		case 'parent':
			// ode.move({ parent: prop.node.parent!.id });
			break;
		default:
			console.log('prop key:', prop.key);
			setMappedProp(model, prop);
		//model.setDataProperty(data, prop.key, prop.value);
	}

	function setMappedProp(model: go.GraphLinksModel, prop: GraphPropertyIdentifier, valueTransformer?: (v: any) => any) {
		const dataObj = model.findNodeDataForKey(prop.node.id);
		if (!dataObj) return;
		const value = valueTransformer ? valueTransformer(prop.value) : prop.value;
		if (!(prop.key in propMap)) {
			debugger;
			return;
		}
		console.log('prop: ', prop.key);
		model.setDataProperty(dataObj, propMap[prop.key] ?? 'error_unknown_prop', value);
		debugger;
	}

	function addSymbolProp(model: go.GraphLinksModel, prop: GraphPropertyIdentifier) {
		const data = model.findNodeDataForKey(prop.node.id);
		if (!data) return;

		const symData = createSymbolNodeData('', prop.value.id);
		//const symData = createSymbolNode('', prop.value.id);

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
		//debugger;
	}
}
