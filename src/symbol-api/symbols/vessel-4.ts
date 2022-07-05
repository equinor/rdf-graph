import { NodeSymbolTemplate } from '../types/NodeSymbol';
import { NodeSymbolConnector, PortDirection } from '../types/NodeSymbolConnector';

const svg = `<svg width="96" height="282" viewBox="0 0 96 282" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="vessel-4">
<g id="group1422-1">
<g id="shape1408-2">
<path id="Vector" d="M92.7144 29.1075L92.7144 252.552" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g id="group1421-5">
<g id="shape1406-6">
<path id="Vector_2" d="M92.7153 252.499H3.25934" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g id="shape1407-9">
<path id="Vector_3" d="M92.7534 29.0565L3.29749 29.0565" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g id="shape1409-12">
<path id="Vector_4" d="M3.33677 29.0547L3.33677 252.499" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g id="shape1413-15">
<path id="Vector_5" d="M3.27197 28.5623C4.24184 25.535 6.10934 22.5555 8.76787 19.7942C11.4264 17.0328 14.8239 14.5435 18.7663 12.4685C22.7087 10.3935 27.1189 8.77335 31.745 7.70061C36.3711 6.62788 41.1225 6.12357 45.728 6.21644" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g id="shape1414-18">
<path id="Vector_6" d="M92.7293 28.562C90.0185 22.6888 83.544 17.0354 74.73 12.8451C65.916 8.65476 55.4842 6.2708 45.7292 6.21755" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g id="shape1415-21">
<path id="Vector_7" d="M92.7283 253.202C91.7584 256.229 89.8909 259.209 87.2323 261.97C84.5738 264.731 81.1763 267.221 77.2339 269.296C73.2915 271.371 68.8813 272.991 64.2552 274.063C59.6291 275.136 54.8776 275.641 50.2722 275.548" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g id="shape1416-24">
<path id="Vector_8" d="M3.27183 253.203C5.98263 259.076 12.4571 264.73 21.2712 268.92C30.0852 273.11 40.517 275.494 50.272 275.547" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</g>
</g>
</g>
</svg>
`;

export const Vessel_4: NodeSymbolTemplate = {
	id: 'vessel-4',
	svg: svg,
	height: 282,
	width: 96,
	connectors: [
		new NodeSymbolConnector('c1', { x: 3.34003, y: 57.5 }, PortDirection.E),
		new NodeSymbolConnector('c2', { x: 3.34003, y: 175.5 }, PortDirection.W),
		new NodeSymbolConnector('c3', { x: 48.5, y: 275.7 }, PortDirection.S),
		new NodeSymbolConnector('c4', { x: 48.5, y: 6.29999 }, PortDirection.N),
	],
};
