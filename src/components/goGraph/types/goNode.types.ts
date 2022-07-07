import { PortDirection } from '../../../symbol-api';
import { SymbolNodePortData } from './goNodeItem.types';

/** Categories that determine the type of node (template) to render */
export enum NodeUiType {
	Default = '',
	SvgSymbol = 'SvgSymbol',
	RctNode = 'RctNode',
}

export type BaseNodeData = {
	id: string;
	category?: NodeUiType;
	label?: string;
	ports?: PortData[];
};

export enum PortType {
	Default = '',
	SvgSymbolPort = 'SvgSymbolPort',
	RctNode = 'RctNode',
}

export type PortData = {
	portId: string;
	name: string;
	type: PortType;
	width?: number;
	height?: number;
	relativePosition?: go.Point;
	direction?: PortDirection;
};

export type RequireNodeCategory<TNodeUiType extends NodeUiType> = Omit<BaseNodeData, 'category'> & {
	category: TNodeUiType;
};

export type DefaultNodeData = RequireNodeCategory<NodeUiType.Default>;

export type SymbolNodeData = RequireNodeCategory<NodeUiType.SvgSymbol> & {
	symbolId: string;
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
