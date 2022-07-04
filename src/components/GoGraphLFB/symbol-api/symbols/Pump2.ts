import { NodeSymbolTemplate } from '../types/NodeSymbol';
import { NodeSymbolConnector, PortBearing } from '../types/NodeSymbolConnector';

const svgString = `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="Circle_accurate">
    <circle id="Ellipse 1" cx="24" cy="24" r="20" stroke="black" />
    <circle id="Ellipse 2" cx="24" cy="24" r="3" stroke="black" />
    <g id="annotations">
        <circle id="Ellipse 3" cx="24" cy="4" r="0.5" fill="#FF0000" />
        <circle id="Ellipse 4" cx="24" cy="24" r="0.5" fill="#FF0000" />
    </g>
</g>
</svg>`;

export const Pump2: NodeSymbolTemplate = {
	id: 'Pump2',
	svg: svgString,
	height: 48,
	width: 48,
	connectors: [new NodeSymbolConnector('cp1', { x: 24, y: 4 }, PortBearing.W), new NodeSymbolConnector('cp2', { x: 24, y: 24 }, PortBearing.E)],
};
