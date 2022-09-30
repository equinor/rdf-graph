import go from 'gojs';

import { ForceDirectedLayout, GoGraphLayout, GoGraphLayoutConfig, GridLayout, LayeredDigraphLayout } from './layout.types';

export function createLayeredDigraphLayout(init?: LayeredDigraphLayout['config']): go.Layout {
	return new go.LayeredDigraphLayout({ ...init });
}

export function createForceDirectedLayout(init?: ForceDirectedLayout['config']): go.Layout {
	return new go.ForceDirectedLayout({ ...init });
}

export function createGridLayout(init?: GridLayout['config']): go.Layout {
	return new go.GridLayout({ ...init });
}

export function getLayout(layout: GoGraphLayoutConfig): go.Layout {
	switch (layout.type) {
		case GoGraphLayout.LayeredDigraph:
			return createLayeredDigraphLayout(layout.config);
		case GoGraphLayout.ForceDirected:
			return createForceDirectedLayout(layout.config);
		case GoGraphLayout.Grid:
			return createGridLayout(layout.config);
		default:
			return createForceDirectedLayout();
	}
}

export function getDefaultLayoutConfig(layout: GoGraphLayout): GoGraphLayoutConfig {
	let cfg: GoGraphLayoutConfig = { type: layout };
	switch (layout) {
		case GoGraphLayout.LayeredDigraph:
			cfg.config = {
				direction: 90,
				setsPortSpots: false,
				layeringOption: go.LayeredDigraphLayout.LayerLongestPathSink,
				layerSpacing: 40,
				columnSpacing: 10,
				packOption: go.LayeredDigraphLayout.PackAll,
				aggressiveOption: go.LayeredDigraphLayout.AggressiveMore,
			};
			break;
		case GoGraphLayout.ForceDirected:
			break;
		case GoGraphLayout.Grid:
			cfg.config = {
				wrappingColumn: 6,
			};
			break;
		default:
			break;
	}

	return cfg;
}
