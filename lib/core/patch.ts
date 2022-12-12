import { Quad, termFromId, termToId, Writer, DataFactory } from 'n3';
import { GraphElement, GraphPatch, GraphState, RdfPatch } from './types';

export function createGraphPatch(state: GraphState, rdfPatches: RdfPatch[]): GraphPatch[] {
	const result: GraphPatch[] = [];

	for (const rdfPatch of rdfPatches) {
		result.push(...rdfToGraphPatch(state, rdfPatch));
	}

	return result;
}

export function rdfToGraphPatch(state: GraphState, { action, data }: RdfPatch): GraphPatch[] {
	
	// add

		// Subject and object handling
			// Yield subject if not exist
			// Yield object if not exist and iri-node

		// Predicate handling when object is an iri node
			// Add edge as predicate node if not exist
			// Yield edge (if not exist) and add edgeRef to predicate node
			// Yield edge properties for all edges predicate node knows about

		// Predicate handling when object is a literal
			// Yield prop to 

	// delete


	let sNode: GraphElement, pNode: GraphElement, oNode: GraphElement;
	const q = data;
	const sTerm = termToId(q.subject);
	const pTerm = termToId(q.predicate);
	const oTerm = termToId(q.object);

	if (action === 'add') {
	} else {
	}

	return [];
}

function applyPatch(patches: GraphPatch[]) {
	for (const patch of patches) {
		switch (patch.element.type) {
			case 'node':
				switch (patch.element.variant) {
					case 'default':
						break;
					case 'connector':
						break;
					default:
						break;
				}
				break;
			case 'edge':
				break;
			case 'property':
				switch (patch.element.target.type) {
					case 'node':
						switch (patch.element.target.variant) {
							case 'connector':
								let a = patch.element.target.props.engSymbolConnectorName;
 
								break;
							case 'default':
								//let b = patch.element.target.name;
								break;
							default:
								break;
						}
						break;

					default:
						break;
				}

				break;
			case 'data':
				break;

			default:
				break;
		}
	}
}
