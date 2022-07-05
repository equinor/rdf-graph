import { SymbolNodePortData } from './goNodeItem.types';

/** Categories that determine the type of node (template) to render */
export enum NodeUiType {
	Default = '',
	SvgSymbol = 'SvgSymbol',
}

export type BaseNodeData = {
	id: string;
	category?: NodeUiType;
	label?: string;
};

export type RequireNodeCategory<TNodeUiType extends NodeUiType> = Omit<BaseNodeData, 'category'> & {
	category: TNodeUiType;
};

export type DefaultNodeData = RequireNodeCategory<NodeUiType.Default>;

export type SymbolNodeData = RequireNodeCategory<NodeUiType.SvgSymbol> & {
	symbolId: string;
	symbolPorts: SymbolNodePortData[];
	svgDataURI: string;
	height: number;
	width: number;
	angle?: number;
};

// test

// const symbol: SymbolNodeData = {
// 	id: '',
// 	category: NodeUiType.SvgSymbol,
// 	symbolId: 'sd',
// 	symbolPorts: [],
// 	svgDataURI: '',
// 	height: 1,
// 	width: 1,
// };
