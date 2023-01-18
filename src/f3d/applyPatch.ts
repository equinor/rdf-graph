import { ForceGraph3DInstance } from '3d-force-graph';
import { GraphEdgePatch, GraphNodePatch, GraphPatch, GraphPropertyPatch } from '../core/types/core';

export function internalApplyPatches(patches: GraphPatch[], f3d: ForceGraph3DInstance) {
	for (const current of patches) {
		applyPatch(f3d, current);
	}
}

function applyPatch(f3d: ForceGraph3DInstance, patch: GraphPatch) {
	if (patch.action === 'add') {
		switch (patch.content.type) {
			case 'node':
				addNode(f3d, patch.content);
				break;
			case 'edge':
				addEdge(f3d, patch.content);
				break;
			case 'property':
				addProperty(f3d, patch.content);
				break;
			default:
				break;
		}
	}
}

function addNode(f3d: ForceGraph3DInstance, _node: GraphNodePatch) {
	const data = {
		nodes: [{ id: 1 }],
		links: [],
	};
	f3d.graphData(data);
}

function addEdge(_f3d: ForceGraph3DInstance, _edge: GraphEdgePatch) {}

const addProperty = (_f3d: ForceGraph3DInstance, _p: GraphPropertyPatch) => {};
