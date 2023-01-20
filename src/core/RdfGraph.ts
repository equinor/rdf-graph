import { Store as N3QuadStore } from 'n3';
import { patchGraphState } from './patch';
import { GraphPatch, GraphState, RdfPatch, UiSymbolProvider } from './types';

export type RdfGraphOptions = {
	symbolProvider: UiSymbolProvider;
};

export class RdfGraph {
	#state: GraphState;
	#quadStore: N3QuadStore;
	#symbolProvider?: UiSymbolProvider;

	constructor(options?: Partial<RdfGraphOptions>) {
		this.#state = {
			nodeStore: {},
			predicateNodeStore: {},
			edgeStore: {},
		};
		this.#quadStore = new N3QuadStore();
		this.#symbolProvider = options?.symbolProvider;
	}

	getState(): Readonly<GraphState> {
		return { ...this.#state };
	}

	getQuadStore(): Readonly<N3QuadStore> {
		return this.#quadStore;
	}

	patch(rdfPatches: RdfPatch[]): GraphPatch[] {
		const newPatches: RdfPatch[] = [];

		for (const patch of rdfPatches) {
			if (patch.action === 'add' && !this.#quadStore.has(patch.data)) {
				this.#quadStore.addQuad(patch.data);
				newPatches.push(patch);
			} else if (patch.action === 'remove' && this.#quadStore.has(patch.data)) {
				this.#quadStore.removeQuad(patch.data);
				newPatches.push(patch);
			}
		}

		const patchGraphResult = patchGraphState(this.#state, newPatches, {
			symbolProvider: this.#symbolProvider,
		});
		this.#state = patchGraphResult.graphState;
		return patchGraphResult.graphPatches;
	}
}
