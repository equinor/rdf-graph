import { NodeSymbolTemplate } from '../types/NodeSymbol';
import { NodeSymbolConnector, PortDirection } from '../types/NodeSymbolConnector';

const svg = `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg>
<svg width="74" height="112" viewBox="0 0 74 112" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="psv-c">
<g id="Group 2">
<g id="shape1414-3">
<path id="Vector" fill-rule="evenodd" clip-rule="evenodd" d="M73 39L25 63L73 87V39Z" fill="black" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g id="shape1413-1">
<path id="Vector_2" fill-rule="evenodd" clip-rule="evenodd" d="M49 111L25 63L1 111H49Z" fill="black" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g id="group1428-5">
<g id="shape1429-6">
<path id="Vector_3" d="M25 1V63" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g id="shape1430-9">
<path id="Vector_4" d="M16.7719 20.5967L31.7745 5.60596" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g id="shape1431-12">
<path id="Vector_5" d="M13.3496 37.404L35.8509 14.9206" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g id="shape1432-15">
<path id="Vector_6" d="M10 53.9939L40 24.0177" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</g>
</g>
<circle id="cp1" cx="25" cy="62.5" r="0.5" fill="#FF0000"/>
<circle id="cp2" cx="73" cy="63" r="0.5" fill="#FF0000"/>
<circle id="cp3" cx="25" cy="111" r="0.5" fill="#FF0000"/>
</g>
</svg>`;

export const PSV_C: NodeSymbolTemplate = {
	id: 'psv-c',
	svg: svg,
	height: 112,
	width: 74,
	connectors: [
		new NodeSymbolConnector('c1', { x: 25, y: 62.5 }, PortDirection.E),
		new NodeSymbolConnector('c2', { x: 73, y: 63 }, PortDirection.S),
		new NodeSymbolConnector('c3', { x: 25, y: 111 }, PortDirection.W),
	],
};
