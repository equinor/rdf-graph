export type Point = { x: number; y: number };

export interface UiSymbol {
	id: string;
	width: number;
	height: number;
	angle?: number;
	svg: string;
	/** Symbol as single svg <path> element value */
	geometry: string;
	connectors: UiSymbolConnector[];
}

export interface UiSymbolConnector {
	id: string;
	direction: number;
	height?: number;
	width?: number;
	position: Point;
}

export interface SymbolOptions {
	rotation?: number;
	fill?: string;
	stroke?: string;
	height?: number;
	width?: number;
	mutateSvgStringOnRotation?: boolean;
	mutateConnectorRelativePosition?: 'none' | 'CenterCenter';
	mutateConnectorRelativePositionOnRotation?: boolean;
}

export type UiSymbolProvider = (id: string, rotation?: number) => UiSymbol | undefined;
