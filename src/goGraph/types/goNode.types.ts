import { SymbolConnector } from '../../core';

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
	DirectionPort = 'DirectionPort',
}
export enum EdgeUiCategory {
	Default = '',
}

export type BaseNodeData = {
	type: 'node';
	id: string;
	category: NodeUiCategory;
	label?: string;
	ports: PortData[];
	angle?: number;
	height?: number;
	width?: number;
	symbolId?: string;
	symbolHeight?: number;
	symbolWidth?: number;
	symbolConnectors?: SymbolConnector[];
};

export type PortData = {
	type: 'port';
	id: string;
	portId: string;
	name?: string;
	category: NodeUiItemCategory;
	width?: number;
	height?: number;
	relativePosition?: go.Point;
	direction?: number;
};

export type EdgeData = {
	type: 'edge';
	id: string;
	from: string;
	fromPort?: string;
	category?: EdgeUiCategory;
	to: string;
	toPort?: string;
};

export type DefaultNodeData = BaseNodeData;

export type SymbolNodeData = BaseNodeData & {
	symbolId?: string;
	svgDataURI?: string;
	height?: number;
	width?: number;
	angle?: number;
	symbolConnectors?: SymbolConnector[];
};

/** A node that has connectors along the edges of a rectangular node (top / bottom / right / left) */
export type EdgeConnectorNodeData = BaseNodeData & {
	text?: string;
	fill?: string;
	height?: number;
	width?: number;
	angle?: number;
};
