import { DataFactory, Quad } from 'n3';
import { GraphEdge, GraphNode } from '../../models';
import { RdfPatch2 } from '../../models/rdfPatch';

import * as P from '../../mapper/predicates';
const { quad: q, literal: l, namedNode: n } = DataFactory;

export const svgWithConnectorQuads = (connectorId: string) => [
	q(n('S'), P.hasSvgPredicate, l('Separator_1')),
	q(n('S'), P.hasConnectorPredicate, n('C')),
	q(n('C'), P.hasConnectorSuffixPredicate, l(connectorId)),
];

export const emptyGraph = () => {
	return { linkIndex: new Map<string, GraphEdge>(), nodeIndex: new Map<string, GraphNode>() };
};
export const toPatch = (quads: Quad[]): RdfPatch2 =>
	quads.map((quad) => {
		return { action: 'add', assertion: quad };
	});
