import { Quad, termFromId, termToId, Writer, DataFactory } from 'n3';
import {
	DefaultNode,
	GraphElement,
	GraphElementInternal,
	GraphNode,
	GraphPatch,
	GraphState,
	RdfPatch,
	SymbolProvider,
} from './types/types';

type PatchGraphResult = {
	graphState: GraphState;
	graphPatches: GraphPatch[];
};

type PatchGraphOptions = {
	symbolProvider: SymbolProvider;
};

const defaultSymbolProvider: SymbolProvider = (id, rotation) => {
	// TODO: implement
	return undefined;
};

export function patchGraphState(
	state: GraphState,
	rdfPatches: RdfPatch[],
	options?: Partial<PatchGraphOptions>
): PatchGraphResult {
	const p: PatchGraphResult = rdfPatches.reduce<PatchGraphResult>(
		(acc, rdfPatch) => {
			const kvern = new GraphKvern({
				graphState: acc.graphState,
				rdfPatch,
				graphPatches: acc.graphPatches,
			}).bind(rdfToGraphPatch(options));

			return {
				graphState: kvern.getState().graphState,
				graphPatches: kvern.getState().graphPatches,
			};
		},
		{ graphState: state, graphPatches: [] }
	);

	return {
		graphState: p.graphState,
		graphPatches: p.graphPatches,
	};
}

// function rdfToGraphPatch(): GraphKvern {
// 	new GraphKvern({ graphState: state, rdfPatch, graphPatches: [] }).bind(addSubjectNode);
// }

export function rdfToGraphPatch(options?: Partial<PatchGraphOptions>): BindFunction {
	const f: BindFunction = (state: MonadState) => {
		return new GraphKvern(state).bind(addSubjectNode);
	};

	return f;
}

// key => (inputKey[], (subject, graphState) => graphState, graphPatch[])

// svgId =>
// rotation =>
// svgImage => (svgId, rotation), (someSvgNode, graphState) => getSymbol(svgId, rotaiton) /*update node with output (and yield prop)

//

// a hasColor "green"

type MonadState = {
	graphState: GraphState;
	rdfPatch: RdfPatch;
	graphPatches: GraphPatch[];
};

type BindFunction = (state: MonadState) => GraphKvern;

class GraphKvern {
	constructor(
		private readonly state: MonadState // readonly rdfPatch: RdfPatch, // readonly graphPatches: GraphPatch[]
	) {}

	bind(f: BindFunction): GraphKvern {
		return f(this.state);
	}

	getState() {
		return this.state;
	}
}

function addNode(state: MonadState, iri: string): GraphKvern {
	const newNode: GraphNode = {
		id: iri,
		type: 'node',
		variant: 'default',
		data: new Map(),
		props: {},
	};

	return new GraphKvern({
		...state,
		graphState: {
			...state.graphState,
			nodeStore: { ...state.graphState.nodeStore, [iri]: newNode },
		},
		graphPatches: [...state.graphPatches, { action: 'add', element: newNode }],
	});
}

function addSubjectNode(state: MonadState): GraphKvern {
	const subjectIri = termToId(state.rdfPatch.data.subject);
	const nodeExists = subjectIri in state.graphState.nodeStore;
	if (state.rdfPatch.action === 'add' && !nodeExists) {
		return addNode(state, subjectIri);
	}
	return new GraphKvern(state);
}

export function rdfToGraphPatch_OLD(
	state: GraphState,
	{ action, data }: RdfPatch,
	options?: Partial<PatchGraphOptions>
): GraphPatch[] {
	// ADD ----------------

	// Potential new node handling
	// --- Add subject to state if not exist
	// --- Add object to state if not exist and iri
	// --- Yield subject if not exist
	// --- Yield object if not exist and iri

	// Edge handling when object is an iri
	// --- Add edge as predicate node if not exist
	// --- Add edgeRef to predicate node
	// --- Yield edge (if not exist)
	// --- Yield edge properties for all edges predicate node knows about
	// --- apply prop rules recursively

	// Prop handling when object is a literal
	// --- if subject is a predicate node:
	// --- --- add prop to predicate node state:
	// --- --- yield prop on all related edges
	// --- else
	// --- --- add prop P to subject's state
	// --- --- Yield prop P
	// --- --- apply prop rules recursively from P

	// REMOVE ----------------

	// predicate handling when object is a literal
	// --- if subject is a predicate node:
	// --- --- remove prop P from predicate node
	// --- --- yield rm P
	// --- else:
	// --- --- apply prop rules recursively from P

	let sNode: GraphElementInternal, pNode: GraphElementInternal, oNode: GraphElementInternal;
	const q = data;
	const sIri = termToId(q.subject);
	const pIri = termToId(q.predicate);
	const oTerm = termToId(q.object);

	const result: GraphPatch[] = [];

	const symbolProvider = options?.symbolProvider ?? defaultSymbolProvider;

	if (action === 'add') {
		// Add subject and yield if not exists

		if (sIri in state.nodeStore) {
			sNode = state.nodeStore[sIri];
		} else {
			sNode = { id: sIri, type: 'node', variant: 'default' } as GraphNode;
			state.nodeStore[sIri] = sNode;
			result.push({ action: 'add', element: sNode });
		}

		if (q.object.termType === 'Literal') {
			return result;
		}

		// Add object and yield if not exists and != literal
		if (oTerm in state.nodeStore) {
			oNode = state.nodeStore[oTerm];
		} else {
			oNode = { id: oTerm, type: 'node', variant: 'default' } as GraphNode;
			state.nodeStore[oTerm] = oNode;
			result.push({ action: 'add', element: oNode });
		}

		// predicate handling when object is a literal
		if (sNode.variant === 'default') {
		}
	} else {
	}

	return result;
}
