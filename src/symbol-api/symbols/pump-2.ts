import { NodeSymbolTemplate } from '../types/NodeSymbol';
import { NodeSymbolConnector, PortDirection } from '../types/NodeSymbolConnector';

const svg = `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg>
<svg width="85" height="96" viewBox="0 0 85 96" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="Pump-2" clip-path="url(#clip0_110_1858)">
<g id="Group">
<g id="shape1408-1">
<path id="Vector" fill-rule="evenodd" clip-rule="evenodd" d="M0.417577 42.7435C0.464323 31.5497 4.91857 20.8305 12.8054 12.9319C20.6923 5.0333 31.3693 0.598694 42.4996 0.598694C53.63 0.598694 64.307 5.0333 72.1938 12.9319C80.0807 20.8305 84.5349 31.5497 84.5817 42.7435C84.6049 48.3162 83.5336 53.8388 81.4292 58.9941C79.3249 64.1494 76.2288 68.836 72.3188 72.7848C68.4088 76.7337 63.7619 79.8671 58.6447 82.0051C53.5275 84.1431 48.0408 85.2437 42.4996 85.2437C36.9584 85.2437 31.4718 84.1431 26.3546 82.0051C21.2374 79.8671 16.5904 76.7337 12.6804 72.7848C8.77045 68.836 5.6744 64.1494 3.57001 58.9941C1.46561 53.8388 0.394305 48.3162 0.417577 42.7435V42.7435Z" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g id="shape1409-3">
<path id="Vector_2" fill-rule="evenodd" clip-rule="evenodd" d="M37.2398 42.7424C37.2398 41.3392 37.7941 39.9934 38.7807 39.0012C39.7673 38.0089 41.1055 37.4515 42.5007 37.4515C43.896 37.4515 45.2342 38.0089 46.2208 39.0012C47.2074 39.9934 47.7617 41.3392 47.7617 42.7424C47.7617 44.1457 47.2074 45.4915 46.2208 46.4837C45.2342 47.476 43.896 48.0334 42.5007 48.0334C41.1055 48.0334 39.7673 47.476 38.7807 46.4837C37.7941 45.4915 37.2398 44.1457 37.2398 42.7424V42.7424Z" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g id="shape1410-5">
<path id="Vector_3" d="M12.738 72.672L0.694427 95.579H84.5839L72.2619 72.672" stroke="black" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</g>
</g>
<defs>
<clipPath id="clip0_110_1858">
<rect width="85" height="96" fill="white"/>
</clipPath>
</defs>
</svg>
`;

export const Pump_2: NodeSymbolTemplate = {
	id: 'Pump-2',
	svg: svg,
	height: 96,
	width: 85,
	connectors: [
		new NodeSymbolConnector('c1', { x: 42.5, y: 42.5 }, PortDirection.E),
		new NodeSymbolConnector('c2', { x: 42.5, y: 0.5 }, PortDirection.W),
	],
};
