import go, { GraphLinksModel } from 'gojs';
import { nodeTemplateKey } from '../core/mapper/predicates';
import { GraphConnector, GraphEdge, GraphNode, GraphPatch, GraphProperty, Assertion, GraphPropertyTarget } from '../core/types/graphModel';
import { getNodeSymbolTemplate, PortDirection } from '../symbol-api';
import { propMap, shapeMap } from './mapper/patchDataMaps';
import { BaseNodeData, EdgeData, NodeUiCategory, NodeUiItemCategory, PortData, SymbolNodeData } from './types';

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
			const n: BaseNodeData = {
				type: 'node',
				id: assertion.id,
				category: NodeUiCategory.Default,
				ports: [],
			};
			model.addNodeData(n);
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
			const edge: EdgeData = {
				type: 'edge',
				id: assertion.id,
				from: assertion.source,
				fromPort: assertion.sourceConnector,
				to: assertion.target,
				toPort: assertion.targetConnector,
			};
			model.addLinkData(edge);
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
			const port: PortData = {
				type: 'port',
				category: NodeUiItemCategory.Default,
				id: assertion.id,
				portId: assertion.id,
			};

			if (nodeData.ports) {
				model.insertArrayItem(nodeData.ports, -1, port);
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
				portIdx = portIdx.findIndex((p) => p.id === assertion.id) as number;
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
function patchProperty(model: go.GraphLinksModel, { action, assertion }: Assertion<GraphProperty<GraphPropertyTarget>>) {
	let data, parent, idx;

	switch (assertion.target.type) {
		case 'edge':
			data = model.findLinkDataForKey(assertion.target.id) as EdgeData;
			break;
		case 'connector':
			parent = model.findNodeDataForKey(assertion.target.node.id) as BaseNodeData;
			if (!parent) break;
			idx = (parent.ports as PortData[])?.findIndex((x) => x.portId === assertion.target.id);
			if (idx === -1 || idx === undefined) break;
			data = (parent.ports as PortData[])[idx] as PortData;
			break;
		case 'metadata':
			break;
		default:
			data = model.findNodeDataForKey(assertion.target.id) as BaseNodeData;
			break;
	}
	if (!data) return;

	switch (assertion.key) {
		case 'symbolName':
			patchSymbol(model, data as SymbolNodeData, { action, assertion });
			break;
		case 'direction':
		case 'relativePosition':
		case 'connectorName':
			patchConnectorProp(model, parent, data as PortData, idx, { action, assertion });
			break;
		case 'shape':
			patchMappedProp(model, data, { action, assertion }, (p: string) => shapeMap[p]);
			break;
		case nodeTemplateKey:
			let prop, val;
			switch (assertion.value) {
				case 'BorderConnectorTemplate':
					prop = 'category';
					val = NodeUiCategory.EdgeConnectorNode;
					break;
				case 'Ellipse':
				case 'Rectangle':
				default:
					prop = 'shape';
					val = assertion.value;
					break;
			}
			patchProp(model, data, action, prop, val);
			break;
		default:
			patchMappedProp(model, data, { action, assertion });
			break;
	}
}

function patchConnectorProp(
	model: go.GraphLinksModel,
	parent: go.ObjectData | undefined,
	data: PortData,
	idx: number | undefined,
	{ action, assertion }: Assertion<GraphProperty<GraphPropertyTarget>>
) {
	let portProp: keyof PortData, portValue: PortDirection;
	const effect = action === 'add' ? set : unset;

	switch (assertion.key) {
		case 'relativePosition':
			break;
		case 'direction':
			portProp = 'direction';

			effect(model, data, 'category', NodeUiItemCategory.DirectionPort, parent?.ports, idx);
			if (parent) {
				const sArray = assertion.value + 'Array';
				const portArray = parent[sArray] as PortData[];
				if (action === 'add')
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
			break;
		case 'connectorName':
			effect(model, data, 'name', assertion.value);
			if (parent) {
				syncSymbolPort(model, parent as SymbolNodeData, idx!, effect);
			}
			break;
		default:
			portProp = assertion.key as keyof PortData;
			effect(model, data, portProp, assertion.value);
			break;
	}
}

function patchMappedProp(
	model: go.GraphLinksModel,
	data: PortData | BaseNodeData | EdgeData,
	{ action, assertion }: Assertion<GraphProperty<GraphPropertyTarget>>,
	valueTransformer?: (v: any) => any
) {
	if (!(assertion.key in propMap) || !data) return;

	const value = valueTransformer ? valueTransformer(assertion.value) : assertion.value;

	patchProp(model, data, action, propMap[assertion.key] ?? 'error_unknown_prop', value);
}
function patchProp(model: go.GraphLinksModel, data: PortData | BaseNodeData | EdgeData, action: 'add' | 'remove', prop: string | any, val: any) {
	const effect = action === 'add' ? set : unset;

	effect(model, data, prop, val);
}

function patchSymbol(model: go.GraphLinksModel, data: SymbolNodeData, { action, assertion }: Assertion<GraphProperty<GraphPropertyTarget>>) {
	if (!data) return;

	const effect = action === 'add' ? set : unset;
	const sym = getNodeSymbolTemplate(assertion.value);

	effect(model, data, 'category', NodeUiCategory.SvgSymbol);
	effect(model, data, 'symbolId', assertion.value);
	effect(model, data, 'width', sym.width);
	effect(model, data, 'height', sym.height);
	effect(model, data, 'svgDataURI', 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sym.svg));
	effect(model, data, 'symbolConnectors', sym.connectors);

	const ports = data.ports;

	if (!ports) return;

	// Set symbol info on ports
	for (let i = ports.length - 1; i >= 0; i--) {
		// Port from generated symbol
		syncSymbolPort(model, data, i, effect);
	}
}

function syncSymbolPort(
	model: go.GraphLinksModel,
	parent: SymbolNodeData,
	idx: number,
	effect: <T extends { type: string }, K extends keyof T>(model: GraphLinksModel, o: T, p: K, v: T[K], arr?: T[], idx?: number) => void
) {
	const p = parent.ports[idx];
	const c = parent.symbolConnectors?.find((x) => x.id === p.name);

	if (c) {
		effect(model, p, 'height', 2);
		effect(model, p, 'width', 2);
		effect(model, p, 'relativePosition', new go.Point(c.point.x, c.point.y));
		effect(model, p, 'direction', c.portDirection);
		effect(model, p, 'category', NodeUiItemCategory.PositionPort, parent.ports, idx);
	}
}

function change<T extends { type: string }, K extends keyof T>(model: GraphLinksModel, o: T, p: string, v: T[K] | null, arr?: T[], idx?: number) {
	if (p === 'category' && typeof v == 'string')
		switch (o.type) {
			case 'node':
				model.setCategoryForNodeData(o, v);
				break;
			case 'port':
				if (arr && typeof idx == 'number') model.removeArrayItem(arr, idx);
				model.setCategoryForNodeData(o, v);
				if (arr && typeof idx == 'number') model.insertArrayItem(arr, idx, o);
				return;
			case 'edge':
				model.setCategoryForLinkData(o, v);
				return;
		}

	model.setDataProperty(o, p, v);
}

function set<T extends { type: string }, K extends keyof T>(model: GraphLinksModel, o: T, p: K, v: T[K], arr?: T[], idx?: number) {
	change(model, ...push(o, p, v), arr, idx);
}

function unset<T extends { type: string }, K extends keyof T>(model: GraphLinksModel, o: T, p: K, v: T[K] | undefined, arr?: T[], idx?: number) {
	change(model, ...pop(o, p, v), arr, idx);
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
