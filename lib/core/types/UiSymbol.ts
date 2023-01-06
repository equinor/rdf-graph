export type Point = { x: number; y: number };

export interface UiSymbol {
	id: string;
	width: number;
	height: number;
	angle?: number;
	svg?: string;
	/** Symbol as single svg <path> element value */
	geometry?: string;
	connectors: UiSymbolConnector[];
}

export interface UiSymbolConnector {
	id: string;
	width: number;
	height: number;
	direction: number;
	position: Point | 'Left' | 'Right' | 'Top' | 'Bottom';
}

export type UiSymbolProvider = (id: string, rotation?: number) => UiSymbol | undefined;
