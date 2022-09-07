import { NodeSymbolConnector, NodeSymbolTemplate, PortDirection } from '../types';

export const Compressor_1: NodeSymbolTemplate = {
	id: 'Compressor_1',
	svg: '',
	geometry: 'M111 1L1 28.4988V69.7494L111 97.253V1Z',
	height: 98,
	width: 112,
	connectors: [
		new NodeSymbolConnector('c1', { x: 1.0, y: 49.0 }, PortDirection.W),
		new NodeSymbolConnector('c2', { x: 111.0, y: 49.0 }, PortDirection.E),
		new NodeSymbolConnector('c3', { x: 26.5, y: 22.1 }, PortDirection.N),
		new NodeSymbolConnector('c4', { x: 81.5, y: 8.39999 }, PortDirection.N),
	],
};
