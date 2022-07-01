import { DefaultNodeData, NodeUiType } from '../types';

export function createDefaultNode(id: string, label?: string): DefaultNodeData {
	return {
		id: id,
		category: NodeUiType.Default,
		label: label,
	};
}
