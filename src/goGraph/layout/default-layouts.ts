import { ForceDirectedLayout, GraphLayout, GraphLayouts, LayeredDigraphLayout } from '../types/layout.types';

export function getDefaultLayout(type: GraphLayouts): GraphLayout {
	switch (type) {
		case GraphLayouts.LayeredDigraph:
			return createLayeredDigraphLayout();
		case GraphLayouts.ForceDirected:
			return createForceDirectedLayout();
		default:
			return createForceDirectedLayout();
	}
}

export function createLayeredDigraphLayout(): LayeredDigraphLayout {
	return {
		type: GraphLayouts.LayeredDigraph,
		data: {
			// TODO: Add default settings
			direction: 1,
		},
	};
}

export function createForceDirectedLayout(): ForceDirectedLayout {
	return {
		type: GraphLayouts.ForceDirected,
		data: {
			// TODO: Add default settings
			b: 's',
		},
	};
}
