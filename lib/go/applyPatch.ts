import { ConnectorNode, GraphPatch, GraphProperty } from 'core/types/types';

export function applyPatch(patches: GraphPatch[], diagram: go.Diagram) {
	for (const patch of patches) {
		switch (patch.element.type) {
			case 'node':
				switch (patch.element.variant) {
					case 'default':
						break;
					case 'connector':
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
								const el = patch.element as GraphProperty<ConnectorNode>;

								let a = patch.element.target.props.connectorRelativePosition;
								const c = patch.element.key;
								const b = (patch.element as GraphProperty<ConnectorNode>).key;

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
