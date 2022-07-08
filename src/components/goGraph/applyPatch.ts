import go, { GraphLinksModel } from 'gojs';
import { GraphConnector, GraphEdge, GraphNode, GraphPatch, GraphPropertyIdentifier } from '../../models/graphModel';
import { propMap, shapeMap } from './mapper/patchDataMaps';
import { createDefaultNodeData } from './node-data-factory/default-node-factory';
import { createSymbolNodeData } from './node-data-factory/symbol-node-factory';
import { BaseNodeData, NodeUiCategory, NodeUiItemCategory, PortData, SymbolNodeData } from './types';

export function applyPatch(diagram: go.Diagram, graphPatch: GraphPatch) {
	diagram.commit((d) => {
		const model = d.model as GraphLinksModel;
		let i = 1;
		for (const a of graphPatch) {
			// console.log(
			// 	`applying patch ${i++} action = ${a.action} ${a.assertion.type}`, a.assertion);
			switch (a.action) {
				case 'add':
					switch (a.assertion.type) {
						case 'node':
							addNode(model, a.assertion);
							break;
						case 'edge':
							addLink(model, a.assertion);
							break;
						case 'connector':
							addPort(model, a.assertion);
							break;
						case 'property':
							addProperty(model, a.assertion);
							break;
						default:
							break;
					}
					break;
				case 'remove':
					switch (a.assertion.type) {
						case 'node':
							removeNode(model, a.assertion);
							break;
						case 'edge':
							removeLink(model, a.assertion);
							break;
						case 'connector':
							removePort(model, a.assertion);
							break;
						case 'property':
							removeProperty(model, a.assertion);
							break;
						case 'metadata':
							break;
						default:
							break;
					}
					break;
			}
		}
	});
}

function addNode(model: go.GraphLinksModel, a: GraphNode): void {
	model.addNodeData(createDefaultNodeData(a.id));
}

function removeNode(model: go.GraphLinksModel, a: GraphNode): void {
	const node = model.findNodeDataForKey(a.id);
	if (!node) return;
	model.removeNodeData(node);
}

function addLink(model: go.GraphLinksModel, ge: GraphEdge): void {
	model.addLinkData({
		id: ge.id,
		from: ge.source,
		fromPort: ge.sourceConnector,
		to: ge.target,
		toPort: ge.targetConnector,
	});
}

function removeLink(model: go.GraphLinksModel, ge: GraphEdge): void {
	const link = model.findLinkDataForKey(ge.id);
	if (!link) return;
	model.removeLinkData(link);
}

function addPort(model: go.GraphLinksModel, gc: GraphConnector): void {
	const nodeData = model.findNodeDataForKey(gc.node.id) as SymbolNodeData;

	if (nodeData === null) {
		console.warn('Parent node of connector not found, node id:', gc.node.id);
		return;
	}

	let ports = nodeData.ports ?? [];

	const portIndex = ports.findIndex((p) => p.name === gc.connectorName);

	// TODO: handle type mapping in a more generic way
	const portType = gc.node.symbolName ? NodeUiItemCategory.PositionPort : NodeUiItemCategory.Default;

	if (portIndex === -1) {
		ports.push({
			portId: gc.id,
			name: gc.connectorName ?? 'Unknown',
			category: portType,
		});
	} else {
		ports[portIndex].portId = gc.id;
		ports[portIndex].category = portType;
	}

	model.setDataProperty(nodeData, 'ports', ports);
}

function removePort(model: go.GraphLinksModel, gc: GraphConnector): void {
	const nodeData = model.findNodeDataForKey(gc.node.id) as SymbolNodeData;
}

function addProperty(model: go.GraphLinksModel, prop: GraphPropertyIdentifier) {
	const ignoredProps = ['relativePosition', 'connectorName'];
	if (ignoredProps.includes(prop.key)) {
		// console.log('Ignored prop:', prop.key);
		// console.log('Ignored prop obj:', { prop });
		return;
	}
	switch (prop.node.type) {
		case 'connector':
			setConnectorProp(model, prop);
			return;
	}

	switch (prop.key) {
		case 'symbol':
			addSymbolProp(model, prop);
			break;
		case 'shape':
			setMappedProp(model, prop, (p: string) => shapeMap[p]);
			break;
		case 'parent':
			// TODO: Implement...
			break;
		default:
			setMappedProp(model, prop);
	}
}
function setConnectorProp(model: go.GraphLinksModel, prop: GraphPropertyIdentifier) {
	if (prop.node.type !== 'connector') throw "shit don't work yo!";
	const dataObj = model.findNodeDataForKey(prop.node.node.id);
	if (!dataObj) return;
	const ports: PortData[] = dataObj.ports;
	if (!ports) return;
	const portIndex = ports.findIndex((p) => p.portId === prop.node.id);
	if (portIndex < 0) return;
	let portProp: keyof PortData, portValue: string;
	switch (prop.key) {
		case 'direction':
			portProp = 'direction';
			switch (prop.value) {
				case 'in':
					portValue = 'top';
					break;
				default:
				case 'out':
					portValue = 'bottom';
					break;
			}
			break;
		default:
			portProp = prop.key as keyof PortData;
			portValue = prop.value;
			break;
	}
	(ports[portIndex] as any)[portProp] = portValue;
	model.setDataProperty(dataObj, 'ports', ports);
}

function setMappedProp(model: go.GraphLinksModel, prop: GraphPropertyIdentifier, valueTransformer?: (v: any) => any) {
	const dataObj = model.findNodeDataForKey(prop.node.id);
	if (!dataObj) return;
	const value = valueTransformer ? valueTransformer(prop.value) : prop.value;
	if (!(prop.key in propMap)) {
		return;
	}

	model.setDataProperty(dataObj, propMap[prop.key] ?? 'error_unknown_prop', value);
}

function addSymbolProp(model: go.GraphLinksModel, prop: GraphPropertyIdentifier) {
	const data = model.findNodeDataForKey(prop.node.id) as BaseNodeData;
	if (!data) return;

	const sym = createSymbolNodeData(prop.node.id, prop.value.id);

	const symPorts = data.ports;

	if (!symPorts) {
		console.error('Ports not defined for node');
		return;
	}

	// Set symbol info on ports
	symPorts.forEach((p) => {
		// Port from generated symbol
		const symPort = sym.ports?.find((po) => po.name === p.name);
		if (!symPort) {
		} else {
			p.category = symPort.category;
			p.height = symPort.width;
			p.width = symPort.height;
			p.relativePosition = symPort.relativePosition;
			p.direction = symPort.direction;
		}
	});

	// Set symbol data
	model.setCategoryForNodeData(data, NodeUiCategory.SvgSymbol);
	model.setDataProperty(data, 'symbolId', sym.symbolId);
	model.setDataProperty(data, 'width', sym.width);
	model.setDataProperty(data, 'height', sym.height);
	model.setDataProperty(data, 'svgDataURI', sym.svgDataURI);

	// Update port data
	model.setDataProperty(data, 'ports', data.ports);
}

function removeProperty(model: go.GraphLinksModel, prop: GraphPropertyIdentifier) {
	const ignoredProps = ['relativePosition', 'connectorName'];
	if (ignoredProps.includes(prop.key)) {
		// console.log('Ignored prop:', prop.key);
		// console.log('Ignored prop obj:', { prop });
		return;
	}

	//console.log(prop.key);

	switch (prop.key) {
		case 'symbol':
			//addSymbolProp(model, prop);
			break;
		case 'shape':
			//setMappedProp(model, prop, (p: string) => shapeMap[p]);
			break;
		case 'parent':
			// ode.move({ parent: prop.node.parent!.id });
			break;
		default:
		//console.log('prop key:', prop.key);
		//setMappedProp(model, prop);
	}
}
