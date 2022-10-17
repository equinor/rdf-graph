import { createContext } from 'react';
import { Store, Quad } from 'n3';
import { RdfState } from './RdfState.types';

export const RdfContext = createContext<RdfState>({
	rdfStore: new Store<Quad, Quad, Quad, Quad>(),
	rdfPatch: [],
});
