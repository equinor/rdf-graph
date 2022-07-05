import { PortDirection } from '../../../symbol-api';

/** Item types for determine item templates inside node templates */
export enum NodeItemType {
	Default = '',
	SvgSymbolPort = 'SvgSymbolPort',
}

export type BaseItemData = {
	type: NodeItemType;
};

export type SymbolNodePortData = Omit<BaseItemData, 'type'> & {
	type: NodeItemType.SvgSymbolPort;
	position: go.Point;
	portId?: string;
	name: string;
	portDirection: PortDirection;
};
