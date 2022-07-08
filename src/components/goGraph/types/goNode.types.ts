import { PortDirection } from '../../../symbol-api';

/** Categories that determine the type of node template to use */
export enum NodeUiCategory {
	Default = '',
	SvgSymbol = 'SvgSymbol',
	EdgeConnectorNode = 'EdgeConnectorNode',
}

/** Categories that determine the type of item template to use  */
export enum NodeUiItemCategory {
	Default = '',
	PositionPort = 'PositionPort',
}

export type BaseNodeData = {
	id: string;
	category?: NodeUiCategory;
	label?: string;
	ports?: PortData[];
};

export type PortData = {
	id: string;
	portId: string;
	name: string;
	category: NodeUiItemCategory;
	width?: number;
	height?: number;
	relativePosition?: go.Point;
	direction?: PortDirection;
};

export type RequireNodeCategory<TNodeUiType extends NodeUiCategory> = Omit<BaseNodeData, 'category'> & {
	category: TNodeUiType;
};

export type DefaultNodeData = RequireNodeCategory<NodeUiCategory.Default>;

export type SymbolNodeData = RequireNodeCategory<NodeUiCategory.SvgSymbol> & {
	symbolId: string;
	svgDataURI: string;
	height: number;
	width: number;
	angle?: number;
};

/** A node that has connectors along the edges of a rectangular node (top / bottom / right / left) */
export type EdgeConnectorNodeData = RequireNodeCategory<NodeUiCategory.EdgeConnectorNode> & {
	text: string;
	fill: string;
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
