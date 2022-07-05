import { GraphProps } from '../state/GraphStateProps';

export type GoGraphProps = GraphProps & { options?: GoGraphOptions };

export type LayoutWrapper = {
	name: string;
	layout: string;
};

//export type GoGraphLayout = 'LayeredDigraphLayout' | 'ForceDirectedLayout';

//const layouts = ['LayeredDigraphLayout', 'ForceDirectedLayout'] as const;

export enum GoGraphLayoutType {
	LayeredDigraphLayout = 'LayeredDigraphLayout',
	ForceDirectedLayout = 'ForceDirectedLayout',
}

interface BaseLayout<T extends GoGraphLayoutType, TData> {
	readonly type: T;
	readonly data: Required<TData>;
}

type LayeredDigraphLayout = BaseLayout<
	GoGraphLayoutType.LayeredDigraphLayout,
	{
		a: number;
	}
>;

type ForceDirectedLayout = BaseLayout<
	GoGraphLayoutType.ForceDirectedLayout,
	{
		b: string;
	}
>;

export type GoGraphLayout = LayeredDigraphLayout | ForceDirectedLayout;

export type GoGraphOptions = {
	layout: GoGraphLayout;
};

const myLayout: LayeredDigraphLayout = {
	type: GoGraphLayoutType.LayeredDigraphLayout,
	data: {
		a: 1,
	},
};
