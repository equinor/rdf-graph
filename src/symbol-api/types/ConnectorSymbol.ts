export interface SymbolConnector {
	readonly id: string;
	readonly x: number;
	readonly y: number;
	readonly direction: number;
}

export interface ConnectorSymbol {
	readonly id: string;
	readonly svgString: string;
	readonly geometryString: string;
	readonly width: number;
	readonly height: number;
	readonly connectors: SymbolConnector[];
}
