import { DefaultNodeData, NodeUiCategory } from '../types';

export function createDefaultNodeData(id: string, label?: string): DefaultNodeData {
	return {
		id: id,
		category: NodeUiCategory.Default,
		label: label,
	};
}
