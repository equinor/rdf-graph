import go from 'gojs';
import { PortDirection } from '../../../symbol-api';
import { EdgeConnectorNodeData, NodeUiCategory, NodeUiItemCategory, PortData } from '../types';

export function createEdgeConnectorNode(id: string, text: string, connecters: any[], fill = '#FF5733'): EdgeConnectorNodeData {
	const ports: PortData[] = [];

	const step = 100;
	const height = 200;

	const topConnectors = connecters.filter(({ direction }) => direction === 'top');
	const bootomConnectors = connecters.filter(({ direction }) => direction === 'bottom');

	const topAmount = topConnectors.length;
	const bottomAmount = bootomConnectors.length;

	// Finding max width between connectors
	const fmwbc = topAmount > bottomAmount ? topAmount : bottomAmount;

	// TOP
	for (let i = 0; i < topAmount; i++) {
		const { id } = topConnectors[i];
		const y = (height / 2) * -1;
		const x = step + step * i;

		ports.push({
			category: NodeUiItemCategory.PositionPort,
			name: `top-${i}`,
			relativePosition: new go.Point(x, y),
			portId: id,
			direction: PortDirection.N,
		});
	}

	// BOTTOM
	for (let i = 0; i < bottomAmount; i++) {
		const { id } = bootomConnectors[i];
		const y = height / 2;
		const x = step + step * i;

		ports.push({
			category: NodeUiItemCategory.PositionPort,
			name: `bottom-${i}`,
			relativePosition: new go.Point(x, y),
			portId: id,
			direction: PortDirection.S,
		});
	}

	return {
		id: id,
		category: NodeUiCategory.EdgeConnectorNode,
		height,
		width: step * fmwbc + step,
		ports,
		text,
		fill,
	};
}
