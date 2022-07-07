import { ForceDirectedLayout, GoGraphLayout, GoGraphLayoutType, LayeredDigraphLayout } from '../GoGraph.types';

export function getDefaultLayout(type: GoGraphLayoutType): GoGraphLayout {
	switch (type) {
		case GoGraphLayoutType.LayeredDigraphLayout:
			return createLayeredDigraphLayout();
		case GoGraphLayoutType.ForceDirectedLayout:
			return createForceDirectedLayout();
		default:
			return createForceDirectedLayout();
	}
}

export function createLayeredDigraphLayout(): LayeredDigraphLayout {
	return {
		type: GoGraphLayoutType.LayeredDigraphLayout,
		data: {
			// TODO: Add default settings
			a: 1,
		},
	};
}

export function createForceDirectedLayout(): ForceDirectedLayout {
	return {
		type: GoGraphLayoutType.ForceDirectedLayout,
		data: {
			// TODO: Add default settings
			b: 's',
		},
	};
}
