import { NodeSymbolTemplate } from '../types/NodeSymbol';
import { NodeSymbolConnector, PortDirection } from '../types/NodeSymbolConnector';

const svg = `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg>
<svg width="98" height="93" viewBox="0 0 98 93" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="lv-o">
<g id="Group 1">
<path id="Vector" fill-rule="evenodd" clip-rule="evenodd" d="M0.999999 92L49 68.0242L0.999999 44.0483L0.999999 92Z" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
<path id="Vector_2" fill-rule="evenodd" clip-rule="evenodd" d="M97 44.0484L49 68.0242L97 92V44.0484Z" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
<path id="Vector_3" d="M25 17L73 17" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
<path id="Vector_4" d="M49 17L49 67" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
<path id="Vector_5" d="M73 16.6232C73 12.4797 70.4714 8.50585 65.9706 5.57593C61.4697 2.64601 55.3652 1 49 1C42.6348 1 36.5303 2.64601 32.0294 5.57593C27.5286 8.50585 25 12.4797 25 16.6232" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</g>
</svg>`;

export const LV_O: NodeSymbolTemplate = {
	id: 'lv-o',
	svg: svg,
	height: 93,
	width: 98,
	connectors: [
		new NodeSymbolConnector('c1', { x: 1, y: 68 }, PortDirection.E),
		new NodeSymbolConnector('c2', { x: 97, y: 68 }, PortDirection.N),
		new NodeSymbolConnector('c3', { x: 49, y: 1 }, PortDirection.S),
	],
};
