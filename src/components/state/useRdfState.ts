import { useReducer } from 'react';
import { RdfAssertion } from '../../models';
import { Store, Quad } from 'n3';
import { RdfAction, RdfState } from './RdfState.types';

const coercePatch = function* (store: Store<Quad, Quad, Quad, Quad>, patches: Iterable<RdfAssertion>) {
	for (const p of patches) {
		switch (p.action) {
			case 'add':
				if (store.has(p.assertion)) continue;
				store.addQuad(p.assertion);
				yield p;
				break;
			case 'remove':
				if (!store.has(p.assertion)) {
					continue;
				}
				store.removeQuad(p.assertion);
				yield p;
		}
	}
};
const reducer: (state: RdfState, action: RdfAction) => RdfState = (state, action) => {
	switch (action.type) {
		case 'add':
		case 'remove':
			const assertions = [
				...coercePatch(
					state.rdfStore,
					[...action.data].map((q) => ({ action: action.type, assertion: q }))
				),
			];
			if (assertions.length === 0) return state;
			return { rdfStore: state.rdfStore, rdfPatch: assertions };

		case 'patch':
			const patches = [...coercePatch(state.rdfStore, action.data)];
			if (patches.length === 0) return state;
			return { rdfStore: state.rdfStore, rdfPatch: patches };

		case 'replace':
			const diffStore = new Store<Quad, Quad, Quad, Quad>([...action.data]);
			const replacements: RdfAssertion[] = [];
			for (const q of state.rdfStore) {
				if (diffStore.has(q)) {
					diffStore.removeQuad(q);
				} else {
					state.rdfStore.removeQuad(q);
					replacements.push({ action: 'remove', assertion: q });
				}
			}
			for (const q of diffStore) {
				state.rdfStore.addQuad(q);
				replacements.push({ action: 'add', assertion: q });
			}
			if (replacements.length === 0) return state;
			return { rdfStore: state.rdfStore, rdfPatch: replacements };

		case 'clear':
			const clearing = [
				...(function* (s): Generator<RdfAssertion> {
					for (const q of s) yield { action: 'remove', assertion: q };
				})(state.rdfStore),
			];
			if (clearing.length === 0) return state;
			return { rdfStore: new Store<Quad, Quad, Quad, Quad>(), rdfPatch: clearing };
	}
};

export const useRdfActionReducer = () => useReducer(reducer, { rdfStore: new Store<Quad, Quad, Quad, Quad>(), rdfPatch: [] });
