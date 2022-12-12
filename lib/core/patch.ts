import { Quad, termFromId, termToId, Writer, DataFactory } from 'n3';
import { GraphElement, GraphPatch, GraphState, RdfPatch } from './types';

export function createGraphPatch(state: GraphState, rdfPatches: RdfPatch[]): GraphPatch[] {
	const result: GraphPatch[] = [];

	for (const rdfPatch of rdfPatches) {
		result.push(...rdfToGraphPatch(state, rdfPatch));
	}

	return result;
}

// key => (inputKey[], (subject, graphState) => graphState, graphPatch[])

// svgId => 
// rotation =>
// svgImage => (svgId, rotation), (someSvgNode, graphState) => getSymbol(svgId, rotaiton) /*update node with output (and yield prop)

//
 
// a hasColor "green"

export function rdfToGraphPatch(state: GraphState, { action, data }: RdfPatch): GraphPatch[] {
	
	// add

		// Potential new node handling
			// Add subject to state if not exist
			// Add object to state if not exist and not iri
			// Yield subject if not exist
			// Yield object if not exist and iri

		// Edge handling when object is an iri
			// Add edge as predicate node if not exist
			// Add edgeRef to predicate node
			// Yield edge (if not exist)
			// Yield edge properties for all edges predicate node knows about
			// apply prop rules recursively


		// Prop handling when object is a literal
			// if subject is a predicate node:
				// add prop to predicate node state:
				// yield prop on all related edges
			// else
				// add prop P to subject's state
				// Yield prop P
				// apply prop rules recursively from P

	// delete
		// predicate handling when object is a literal
			// if subject is a predicate node:
				// remove prop P from predicate node
				// yield rm P
			// else:
				//apply prop rules recursively from P



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
