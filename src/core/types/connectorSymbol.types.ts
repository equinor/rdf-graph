// These are the base Connector Symbol types that describes
// information supplied by a Connector Symbol SVG file.

export interface ConnectorSymbol {
	id: string;
	svgString: string;
	geometryString: string;
	width: number;
	height: number;
	connectors: SymbolConnector[];
}

export interface SymbolConnector {
	id: string;
	relativePosition: { x: number; y: number };
	direction: number;
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
