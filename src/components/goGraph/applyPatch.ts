import go, { GraphLinksModel } from 'gojs';
import { ModifierFlags } from 'typescript';
import { nodeTemplateKey } from '../../mapper/predicates';
import { GraphAssertion, GraphConnector, GraphEdge, GraphNode, GraphPatch, GraphProperty, Assertion } from '../../models/graphModel';
import { getNodeSymbolTemplate, PortDirection } from '../../symbol-api';
import { propMap, shapeMap } from './mapper/patchDataMaps';
import { createDefaultNodeData } from './node-data-factory/default-node-factory';
import { createSymbolNodeData } from './node-data-factory/symbol-node-factory';
import { BaseNodeData, NodeUiCategory, NodeUiItemCategory, PortData, SymbolNodeData } from './types';

export function applyPatch(diagram: go.Diagram, graphPatch: GraphPatch) {
	diagram.commit((d) => {
		const model = d.model as GraphLinksModel;

		for (const { action, assertion } of graphPatch) {
			switch (assertion.type) {
				case 'node':
					patchNode(model, { action, assertion });
					break;
				case 'edge':
					patchEdge(model, { action, assertion });
					break;
				case 'connector':
					patchConnector(model, { action, assertion });
					break;
				case 'property':
					patchProperty(model, { action, assertion });
					break;
				case 'metadata':
					break;
				default:
					break;
			}
		}
	});
}

function patchNode(model: go.GraphLinksModel, { action, assertion }: Assertion<GraphNode>) {
	switch (action) {
		case 'add':
			model.addNodeData(createDefaultNodeData(assertion.id));
			break;
		case 'remove':
			const node = model.findNodeDataForKey(assertion.id);
			if (!node) return;
			model.removeNodeData(node);
			break;
	}
}

function patchEdge(model: go.GraphLinksModel, { action, assertion }: Assertion<GraphEdge>) {
	switch (action) {
		case 'add':
			model.addLinkData({
				id: assertion.id,
				from: assertion.source,
				fromPort: assertion.sourceConnector,
				to: assertion.target,
				toPort: assertion.targetConnector,
			});
			break;
		case 'remove':
			const link = model.findLinkDataForKey(assertion.id);
			if (!link) return;
			model.removeLinkData(link);
			break;
	}
}

function patchConnector(model: go.GraphLinksModel, { action, assertion }: Assertion<GraphConnector>) {
	const nodeData = model.findNodeDataForKey(assertion.node.id) as SymbolNodeData;
	switch (action) {
		case 'add':
			if (nodeData === null) {
				console.warn(`Parent node of connector not found, node id: ${assertion.node.id}`);
				return;
			}
			// const portType = assertion.node.symbolName ? NodeUiItemCategory.PositionPort : NodeUiItemCategory.Default;
			const port = {
				id: assertion.id,
				portId: assertion.id,
				// category: portType,-
			};

			if (nodeData.ports) {
				model.addArrayItem(nodeData.ports, port);
			} else {
				model.setDataProperty(nodeData, 'ports', [port]);
			}
			break;
		case 'remove':
			let err, portIdx;
			try {
				err = `parent node for connector ${assertion.node.id} not found`;
				portIdx = nodeData.ports as PortData[];
				err = `node ${assertion.node.id} has no ports array`;
				portIdx = portIdx.findIndex((p) => p.id == assertion.id) as number;
				err = `port ${assertion.id} not found on node ${assertion.node.id}`;
				if (portIdx < 0) throw '';
			} catch {
				console.warn(err);
				return;
			}
			model.removeArrayItem(nodeData.ports!, portIdx);
			break;
	}
}
function patchProperty(model: go.GraphLinksModel, { action, assertion }: Assertion<GraphProperty>) {
	let data, parent;
	switch (assertion.node.type) {
		case 'edge':
			data = model.findLinkDataForKey(assertion.node.id);
			break;
		case 'connector':
			parent = model.findNodeDataForKey(assertion.node.node.id);
			if (!parent) return;
			data = (parent.ports as PortData[])?.find((x) => x.portId == assertion.node.id);
			break;
		default:
			data = model.findNodeDataForKey(assertion.node.id);
			break;
	}
	if (!data) return;
	switch (assertion.key) {
		case 'symbolName':
			patchSymbol(model, data, { action, assertion });
			break;
		case 'direction':
		case 'relativePosition':
		case 'connectorName':
			patchConnectorProp(model, parent, data, { action, assertion });
			break;
		case 'shape':
			patchMappedProp(model, data, { action, assertion }, (p: string) => shapeMap[p]);
			break;
		case nodeTemplateKey:
		default:
			patchMappedProp(model, data, { action, assertion });
			break;
	}
}

function patchConnectorProp(
	model: go.GraphLinksModel,
	parent: go.ObjectData | undefined,
	data: Partial<PortData>,
	{ action, assertion }: Assertion<GraphProperty>
) {
	let portProp: keyof PortData, portValue: any;
	const effect = action == 'add' ? set : unset;
	switch (assertion.key) {
		case 'relativePosition':
			break;
		case 'direction':
			portProp = 'direction';

			if (parent) {
				const sArray = assertion.value + 'Array';
				const portArray = parent[sArray] as PortData[];
				if (action == 'add')
					if (!portArray) model.setDataProperty(parent, sArray, [data]);
					else model.insertArrayItem(portArray, -1, data);
				else {
					const idx = parent[sArray].indexOf(data);
					if (idx < 0) return;
					model.removeArrayItem(portArray, idx);
					if (portArray.length < 1) model.setDataProperty(parent, sArray, undefined);
				}
			}
			switch (assertion.value) {
				case 'south':
					portValue = PortDirection.S;
					break;
				case 'north':
					portValue = PortDirection.N;
					break;
				case 'east':
					portValue = PortDirection.E;
					break;
				case 'west':
					portValue = PortDirection.W;
					break;
				default:
					portValue = assertion.value;
					break;
			}
			effect(model, data, portProp, portValue);
			effect(model, data, 'category', NodeUiItemCategory.DirectionPort);
			break;
		case 'connectorName':
			effect(model, data, 'name', assertion.value);
			if (parent) syncSymbolPort(model, data, parent, effect);
			break;
		default:
			portProp = assertion.key as keyof PortData;
			effect(model, data, portProp, assertion.value);
			break;
	}
}

function patchMappedProp(model: go.GraphLinksModel, data: any, { action, assertion }: Assertion<GraphProperty>, valueTransformer?: (v: any) => any) {
	if (!(assertion.key in propMap)) return;
	if (!data) return;
	const effect = action == 'add' ? set : unset;
	const value = valueTransformer ? valueTransformer(assertion.value) : assertion.value;
	effect(model, data, propMap[assertion.key] ?? 'error_unknown_prop', value);
}

function patchSymbol(model: go.GraphLinksModel, data: Partial<SymbolNodeData>, { action, assertion }: Assertion<GraphProperty>) {
	// const data = model.findNodeDataForKey(assertion.node.id) as SymbolNodeData;
	if (!data) return;
	const effect = action == 'add' ? set : unset;
	const sym = getNodeSymbolTemplate(assertion.value);
	effect(model, data, 'category', NodeUiCategory.SvgSymbol);
	effect(model, data, 'symbolId', assertion.value);
	effect(model, data, 'width', sym.width);
	effect(model, data, 'height', sym.height);
	effect(model, data, 'svgDataURI', 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sym.svg));
	effect(model, data, 'symConnectors', sym.connectors);

	const ports = data.ports;

	if (!ports) return;

	// Set symbol info on ports
	for (const p of ports) {
		// Port from generated symbol
		syncSymbolPort(model, p, data, effect);
	}
}

function syncSymbolPort(
	model: go.GraphLinksModel,
	p: Partial<PortData>,
	parent: Partial<SymbolNodeData>,
	effect: <T, K extends keyof T>(model: GraphLinksModel, o: T, p: K, v: T[K]) => void
) {
	const c = parent.symConnectors?.find((x) => x.id == p.name);
	if (!c) {
	} else {
		effect(model, p, 'category', NodeUiItemCategory.PositionPort);
		effect(model, p, 'height', 2);
		effect(model, p, 'width', 2);
		effect(model, p, 'relativePosition', new go.Point(c.point.x, c.point.y));
		effect(model, p, 'direction', c.portDirection);
	}
}

function change<T, K extends keyof T>(model: GraphLinksModel, o: T, p: string, v: T[K] | null) {
	switch (p) {
		case 'category':
			if ('type' in o && (o as any).type == 'edge') {
				model.setCategoryForLinkData(o, typeof v === 'string' ? v : `${v}`);
			} else {
				model.setCategoryForNodeData(o, typeof v === 'string' ? v : `${v}`);
			}
			break;
		default:
			model.setDataProperty(o, p, v);
	}
}
function set<T, K extends keyof T>(model: GraphLinksModel, o: T, p: K, v: T[K]) {
	change(model, ...push(o, p, v));
}
function unset<T, K extends keyof T>(model: GraphLinksModel, o: T, p: K, v: T[K] | undefined) {
	change(model, ...pop(o, p, v));
}
function push<T, K extends keyof T>(obj: T, prop: K, val: T[K]): [T, string, T[K]] {
	let history: Map<K, T[K][]>;
	if (!(history = (obj as any).__history__)) (obj as any).__history__ = history = new Map<K, T[K][]>();
	if (history.has(prop)) history.get(prop)!.push(val);
	else history.set(prop, [val]);
	const strProp = typeof prop == 'string' ? prop : prop.toString();
	return [obj, strProp, val];
}
function pop<T, K extends keyof T>(obj: T, prop: K, val: T[K] | undefined): [T, string, T[K] | null] {
	let history: Map<K, T[K][]>;
	const strProp = typeof prop == 'string' ? prop : prop.toString();
	if (!(history = (obj as any).__history__) || !history.has(prop)) return [obj, strProp, null];
	const stack = history.get(prop)!;
	let prev;
	if (val) {
		let prevIdx;
		if ((prevIdx = stack.indexOf(val)) > -1) {
			stack.splice(prevIdx, 1);
			prev = stack[stack.length - 1];
		} else {
			prev = val;
			console.warn(`could not remove value ${val} from history of ${prop.toString()}`);
		}
	} else prev = stack.pop();
	if (prev === undefined) prev = null;
	if (stack.length < 1) history.delete(prop);
	if (history.size < 1) delete (obj as any).__history__;
	return [obj, strProp, prev];
}
