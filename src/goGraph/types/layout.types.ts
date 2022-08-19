import { GraphProps } from '../../core/state/GraphStateProps';

export type OptionsGraphProps = GraphProps & { options?: Partial<LayoutProps> };

export type GoGraphNodeHighlightProps = go.Node & { highlight?: number };

export type LayoutWrapper = {
	name: string;
	layout: string;
};

export enum GraphLayouts {
	LayeredDigraph = 'LayeredDigraphLayout',
	ForceDirected = 'ForceDirectedLayout',
}

interface BaseLayout<T extends GraphLayouts, TData> {
	readonly type: T;
	readonly data: TData;
}

export type LayeredDigraphLayout = BaseLayout<
	GraphLayouts.LayeredDigraph,
	{
		direction: number;
	}
>;

export type ForceDirectedLayout = BaseLayout<
	GraphLayouts.ForceDirected,
	{
		b: string;
	}
>;

export type GraphLayout = LayeredDigraphLayout | ForceDirectedLayout;

export type LayoutProps = {
	layout: GraphLayout;
};
