import { NodeSymbolTemplate } from '../types/NodeSymbol';
import { NodeSymbolConnector, PortDirection } from '../types/NodeSymbolConnector';

const svg = `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg>
<svg width="98" height="50" viewBox="0 0 98 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="vg-c">
<g id="shape1413-1">
<path id="Vector" fill-rule="evenodd" clip-rule="evenodd" d="M0.999999 49L49 25L0.999999 1V49Z" fill="black" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g id="shape1414-3">
<path id="Vector_2" fill-rule="evenodd" clip-rule="evenodd" d="M97 0.999998L49 25L97 49V0.999998Z" fill="black" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g id="shape1422-5">
<path id="Vector_3" d="M49 1V49.5" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</g>
</svg>`;

export const VG_C: NodeSymbolTemplate = {
	id: 'vg-c',
	svg: svg,
	height: 50,
	width: 98,
	connectors: [new NodeSymbolConnector('c1', { x: 1, y: 25 }, PortDirection.E), new NodeSymbolConnector('c2', { x: 97, y: 25 }, PortDirection.W)],
};
