import {
	GraphDataProperty,
	GraphEdge,
	GraphElement,
	GraphNode,
	GraphPatch,
	GraphProperty,
} from 'core/types/types';

export function applyPatch(patches: GraphPatch[], diagram: go.Diagram) {
	for (const patch of patches) {
		switch (patch.element.type) {
			case 'node':
				switch (patch.element.variant) {
					case 'default':
					case 'symbol':
					case 'connector':
						if (patch.action === 'add') {
							addNode(diagram, patch.element);
						}
						break;
					default:
						break;
				}
				break;
			case 'edge':
				if (patch.action === 'add') {
					addEdge(diagram, patch.element);
				}
				break;
			case 'property':
				switch (patch.element.target.type) {
					case 'node':
						switch (patch.element.target.variant) {
							case 'symbol':
							case 'connector':
							case 'default':
								if (patch.action === 'add') {
									addNodeProp(diagram, patch.element);
								}
								break;
							default:
								break;
						}
						break;
					case 'edge':
						if (patch.action === 'add') {
							addEdgeProp(diagram, patch.element);
						} else {
						}
						break;
					default:
						break;
				}

				break;
			case 'data':
				switch (patch.element.target.type) {
					case 'node':
						switch (patch.element.target.variant) {
							case 'symbol':
							case 'connector':
							case 'default':
								if (patch.action === 'add') {
									addNodeDataProp(diagram, patch.element);
								}
								break;
							default:
								break;
						}
						break;

					default:
						break;
				}
				break;

			default:
				break;
		}
	}
	console.log();
	diagram.nodes.each((n) => {
		console.log(n.data);
	});
}

function addNode(diagram: go.Diagram, node: GraphNode) {
	diagram.model.addNodeData({
		id: node.id,
		type: node.type,
		variant: node.variant,
		label: node.props.label ?? node.id,
		category: '',
		ports: [],
		data: {},
	});
}

function addNodeProp(diagram: go.Diagram, prop: GraphProperty<GraphElement>) {
	const nodeData = diagram.model.findNodeDataForKey(prop.target.id);
	if (!nodeData) return;
	diagram.model.setDataProperty(nodeData, prop.key, prop.value);
}

function addNodeDataProp(diagram: go.Diagram, prop: GraphDataProperty) {
	const nodeData = diagram.model.findNodeDataForKey(prop.target.id);
	if (!nodeData) return;
	diagram.model.setDataProperty(nodeData, 'data', { ...nodeData.data, [prop.key]: prop.values });
}

function addEdge(diagram: go.Diagram, edge: GraphEdge) {
	(diagram.model as go.GraphLinksModel).addLinkData({
		id: edge.id,
		type: edge.type,
		from: edge.sourceId,
		to: edge.targetId,
	});
}

function addEdgeProp(diagram: go.Diagram, prop: GraphProperty<GraphElement>) {
	const linkData = (diagram.model as go.GraphLinksModel).findLinkDataForKey(prop.target.id);

	if (!linkData) return;
	diagram.model.setDataProperty(linkData, prop.key, prop.value);
}
