import { NodeSymbolTemplate } from '../types/NodeSymbol';
import { NodeSymbolConnector, PortBearing } from '../types/NodeSymbolConnector';

const svgString = `<svg width="98" height="50" viewBox="0 0 98 50" xmlns="http://www.w3.org/2000/svg" stroke="black" fill="none">
  <g id="vg-o">
    <g id="shape1413-1">
      <path id="Vector" fill-rule="evenodd" clip-rule="evenodd" d="M0.999999 49.0958L49 25.0958L0.999999 1.0958V49.0958Z" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round" />
    </g>
    <g id="shape1414-3">
      <path id="Vector_2" fill-rule="evenodd" clip-rule="evenodd" d="M97 1.0958L49 25.0958L97 49.0958V1.0958Z" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round" />
    </g>
    <g id="shape1422-5">
      <path id="Vector_3" d="M49 1.0958V49.5958" stroke-miterlimit="3" stroke-linecap="round" stroke-linejoin="round" />
    </g>
  </g>
</svg>`;

export const Valve_gate_o: NodeSymbolTemplate = {
	id: 'Valve_gate_o',
	svg: svgString,
	height: 50,
	width: 98,
	connectors: [new NodeSymbolConnector('cp1', { x: 0, y: 25 }, PortBearing.W), new NodeSymbolConnector('cp2', { x: 98, y: 25 }, PortBearing.E)],
};
