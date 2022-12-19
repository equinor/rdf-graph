import { ConnectorNode, GraphPatch, GraphProperty } from 'core/types/types';

export function applyPatch(patches: GraphPatch[], diagram: go.Diagram) {
	for (const patch of patches) {
		switch (patch.element.type) {
			case 'node':
				switch (patch.element.variant) {
					case 'default':
						diagram.model.addNodeData({
							id: patch.element.id,
							type: patch.element.type,
							variant: patch.element.variant,
							label: patch.element.props.label ?? patch.element.id,
							category: '',
							ports: [],
						});
						break;
					case 'connector':
						//patch.element.
						break;
					default:
						break;
				}
				break;
			case 'edge':
				break;
			case 'property':
				switch (patch.element.target.type) {
					case 'node':
						switch (patch.element.target.variant) {
							case 'connector':
								const el = patch.element.target;

								let a = patch.element.target.props.connectorRelativePosition;
								const c = patch.element.key;
								const b = patch.element.key;

								if (patch.element.key === 'connectors') {
								}

								break;
							case 'default':
								//let b = patch.element.target.name;
								break;
							default:
								break;
						}
						break;
					default:
						break;
				}

				break;
			case 'data':
				break;

			default:
				break;
		}
	}
}
