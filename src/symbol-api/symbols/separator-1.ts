import { NodeSymbolTemplate } from '../types/NodeSymbol';
import { NodeSymbolConnector, PortDirection } from '../types/NodeSymbolConnector';

const svg = `<svg width="117" height="117" viewBox="0 0 117 117" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="Symbol 3" clip-path="url(#clip0_155_51397)">
<g id="PT003A">
<g id="group1437-1">
<g id="group1425-2">
<g id="shape1426-3">
<path id="Vector" d="M77.6311 12.089V104.872" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g id="group1427-6">
<g id="shape1428-7">
<path id="Vector_2" d="M77.6313 104.85H40.3579" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g id="shape1429-10">
<path id="Vector_3" d="M77.6475 12.0677H40.374" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g id="shape1430-13">
<path id="Vector_4" d="M40.3904 12.0668V104.85" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g id="shape1431-16">
<path id="Vector_5" d="M40.3658 11.8625C40.769 10.6044 41.5464 9.36646 42.6535 8.21945C43.7606 7.07243 45.1758 6.03878 46.8182 5.17752C48.4607 4.31625 50.2982 3.64424 52.226 3.19984C54.1537 2.75545 56.1338 2.54739 58.0534 2.58753" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g id="shape1432-19">
<path id="Vector_6" d="M77.635 11.8622C76.5073 9.42122 73.8108 7.07284 70.1387 5.33363C66.4666 3.59443 62.1197 2.60685 58.054 2.58812" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g id="shape1433-22">
<path id="Vector_7" d="M77.6342 105.142C77.231 106.4 76.4536 107.638 75.3465 108.785C74.2394 109.932 72.8242 110.966 71.1818 111.827C69.5393 112.688 67.7018 113.36 65.774 113.805C63.8463 114.249 61.8661 114.457 59.9466 114.417" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g id="shape1434-25">
<path id="Vector_8" d="M40.3655 105.142C41.4932 107.583 44.1897 109.932 47.8618 111.671C51.5339 113.41 55.8809 114.398 59.9466 114.416" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</g>
</g>
<g id="shape1435-28">
<path id="Vector_9" d="M40.3696 34.0687L77.5692 34.0552" stroke="black" stroke-miterlimit="3" stroke-linecap="square" stroke-dasharray="0.22 0.22"/>
</g>
<g id="shape1436-31">
<path id="Vector_10" d="M40.3496 80.2811L77.5491 80.2676" stroke="black" stroke-miterlimit="3" stroke-linecap="square" stroke-dasharray="0.22 0.22"/>
</g>
</g>
<circle id="Connector1" cx="50.5" cy="3.50226" r="0.5" fill="#EB0000"/>
<circle id="Connector2" cx="40.5" cy="24.5023" r="0.5" fill="#EB0000"/>
<circle id="Connector3" cx="59.5" cy="114.502" r="0.5" fill="#EB0000"/>
</g>
</g>
<defs>
<clipPath id="clip0_155_51397">
<rect width="117" height="117" fill="white"/>
</clipPath>
</defs>
</svg>
`;

export const Separator_1: NodeSymbolTemplate = {
	id: 'Separator_1',
	svg: svg,
	height: 117,
	width: 117,
	connectors: [
		new NodeSymbolConnector('c1', { x: 50.5, y: 3.50226 }, PortDirection.N),
		new NodeSymbolConnector('c2', { x: 40.5, y: 24.5023 }, PortDirection.W),
		new NodeSymbolConnector('c3', { x: 59.5, y: 114.502 }, PortDirection.S),
	],
};
