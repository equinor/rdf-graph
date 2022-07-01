import { Diagram, GraphLinksModel } from 'gojs';
import { GraphAssertion, GraphEdge, GraphNode, GraphPatch, GraphPropertyIdentifier } from '../../../models/graphModel';
import { createSymbolNode } from '../node-factory/symbol-node-factory';
import { BaseNodeData } from '../types';

type Assertion = GraphEdge | GraphNode | GraphPropertyIdentifier;

// export function addAssertion(d: Diagram, a: Assertion) {
// 	switch (a.type) {
// 		case 'node':
// 			d.model.addNodeData(createNode(a));
// 			break;
// 		case 'link':
// 			(d.model as GraphLinksModel).addLinkData(a);
// 			break;
// 		case 'linkNode':
// 			break;
// 		case 'property':
// 			d.model.setDataProperty(a.node, a.key, a.value);
// 			break;
// 	}
// }

// function createNode(a: GraphNode): BaseNodeData {
// 	switch (a.) {
// 		case "symbol":
// 			return createSymbolNode(a.node.id, a.node.symbolName)
// 			break;

// 		default:
// 			break;
// 	}
// }
