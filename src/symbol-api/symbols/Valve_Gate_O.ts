import { NodeSymbolConnector, NodeSymbolTemplate, PortDirection } from '../types';

export const Valve_Gate_O: NodeSymbolTemplate = {
	id: 'Valve_Gate_O',
	svg: '',
	geometry: 'M0.999999 49.0958L49 25.0958L0.999999 1.0958V49.0958Z M97 1.0958L49 25.0958L97 49.0958V1.0958Z M49 1.0958V49.5958',
	height: 50,
	width: 98,
	connectors: [
		new NodeSymbolConnector('c1', { x: 1.0, y: 25.0 }, PortDirection.W),
		new NodeSymbolConnector('c2', { x: 97.0, y: 25.0 }, PortDirection.E),
	],
};
