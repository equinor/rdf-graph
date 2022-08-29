export enum GoGraphLayout {
	LayeredDigraph = 'LayeredDigraph',
	ForceDirected = 'ForceDirected',
}

export type BaseLayoutConfig<T extends GoGraphLayout, C> = {
	type: T;
	config?: C;
};

export type ForceDirectedLayout = BaseLayoutConfig<GoGraphLayout.ForceDirected, Partial<go.ForceDirectedLayout>>;

export type LayeredDigraphLayout = BaseLayoutConfig<GoGraphLayout.LayeredDigraph, Partial<go.LayeredDigraphLayout>>;

export type GoGraphLayoutConfig = ForceDirectedLayout | LayeredDigraphLayout;