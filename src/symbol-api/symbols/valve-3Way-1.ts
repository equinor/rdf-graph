import { NodeSymbolTemplate } from '../types/NodeSymbol';
import { NodeSymbolConnector, PortDirection } from '../types/NodeSymbolConnector';

const svg = `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg>
<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="valve-3-way-1 1">
<rect width="48" height="48" fill="#06FD3D" fill-opacity="0"/>
<g id="Group">
<path id="Vector" fill-rule="evenodd" clip-rule="evenodd" d="M3.99992 39L24.0547 29.0472L3.99992 19.0944V39Z" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
<path id="Vector_2" fill-rule="evenodd" clip-rule="evenodd" d="M14.0241 9.00002L24.0515 28.9056L34.0789 9.00002H14.0241Z" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
<path id="Vector_3" fill-rule="evenodd" clip-rule="evenodd" d="M44.0001 19.0601L23.9453 29.0129L44.0001 38.9657V19.0601Z" fill="black" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
<path id="Vector_4" d="M24 9V0" stroke="black"/>
<path id="Vector_5" d="M0 28.5H4" stroke="black"/>
<path id="Vector_6" d="M44 29.5H48" stroke="black"/>
</g>
</g>
</svg>`;

export const Valve_3Way_1: NodeSymbolTemplate = {
	id: 'Valve_3Way_1',
	svg: svg,
	height: 48,
	width: 48,
	connectors: [
		new NodeSymbolConnector('c1', { x: 0.5, y: 28.5 }, PortDirection.E),
		new NodeSymbolConnector('c2', { x: 24, y: 0.5 }, PortDirection.S),
		new NodeSymbolConnector('c3', { x: 47.5, y: 29.5 }, PortDirection.W),
	],
};
