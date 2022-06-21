import { createContext, useReducer, useState } from 'react';
import { Store, Quad } from 'n3';
import { RdfStateProps } from './RdfState.types';

export const RdfContext = createContext<RdfStateProps>({ rdfStore: new Store<Quad, Quad, Quad, Quad>(), rdfPatch: [] });
