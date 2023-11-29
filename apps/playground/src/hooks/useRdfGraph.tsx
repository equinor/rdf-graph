import { GraphPatch, RdfGraph, UiSymbolProvider } from '@equinor/rdf-graph';
import { useEffect, useRef, useState } from 'react';
import { GraphSelection, useGraphContext } from '../context/GraphContext';
import { printGraphPatchesToConsole } from '../utils/debug';

export const useRdfGraph = (symbolProvider?: UiSymbolProvider) => {
	const { graphContext, dispatch } = useGraphContext();
	const rdfGraphRef = useRef<RdfGraph>();
	const [graphPatches, setGraphPatches] = useState<GraphPatch[]>([]);

	const graphSelectionChangedHandler: (selection: GraphSelection) => void = (selection) => {
		dispatch({
			type: 'SetGraphSelection',
			selection,
		});
	};

	useEffect(() => {
		rdfGraphRef.current = new RdfGraph({ symbolProvider });
	}, []);

	useEffect(() => {
		if (!symbolProvider) return;
		rdfGraphRef.current?.setSymbolProvider(symbolProvider);
	}, [symbolProvider]);

	useEffect(() => {
		if (!rdfGraphRef.current || graphContext.rdfPatches.length === 0) return;

		const newPatches = rdfGraphRef.current.patch(graphContext.rdfPatches);

		setGraphPatches(newPatches);

		//console.log('Graph Patches:');
		printGraphPatchesToConsole(newPatches);

		dispatch({
			type: 'SetGraphState',
			graphState: rdfGraphRef.current.getState(),
		});

		dispatch({
			type: 'SetQuadStore',
			quadStore: rdfGraphRef.current.getQuadStore(),
		});
	}, [graphContext.rdfPatches]);

	useEffect(() => {
		if (graphContext.customPatches.length === 0) return;
		setGraphPatches(graphContext.customPatches);
	}, [graphContext.customPatches]);

	return { graphPatches, graphSelectionChangedHandler };
};
