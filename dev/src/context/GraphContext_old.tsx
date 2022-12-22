import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { GraphState, RdfPatch } from '@rdf-graph/types/types';

export type GraphSelection = {
	nodes: string[];
	edges: string[];
};

export type GraphContextData = {
	rdfPatchesHistory: RdfPatch[];
	rdfPatches: RdfPatch[];
	dispatchRdfPatches: (rdfPatches: RdfPatch[]) => void;
	graphSelection: GraphSelection;
	updateGraphSelection: (selection: GraphSelection) => void;
	graphState: GraphState;
	updateGraphState: (state: GraphState) => void;
	reset: () => void;
};

const getDefaultContext: () => GraphContextData = () => {
	return {
		rdfPatches: [],
		dispatchRdfPatches: () => {},
		rdfPatchesHistory: [],
		graphSelection: { nodes: [], edges: [] },
		updateGraphSelection: () => {},
		graphState: { nodeStore: {}, edgeStore: {}, predicateNodeStore: {} },
		updateGraphState: () => {},
		reset: () => {},
	};
};

export const GraphContext = createContext<GraphContextData>(getDefaultContext());

export const GraphContextProvider: React.FunctionComponent<React.PropsWithChildren> = ({
	children,
}) => {
	const [rdfPatches, setRdfPatches] = useState<RdfPatch[]>(() => getDefaultContext().rdfPatches);
	const [rdfPatchesHistory, setRdfPatchesHistory] = useState<RdfPatch[]>(
		() => getDefaultContext().rdfPatches
	);

	const [graphSelection, setGraphSelection] = useState<GraphSelection>(
		() => getDefaultContext().graphSelection
	);

	const [graphState, setGraphState] = useState<GraphState>(() => getDefaultContext().graphState);

	const dispatchRdfPatches = useCallback((rdfPatches: RdfPatch[]) => {
		setRdfPatches(rdfPatches);
	}, []);

	const updateGraphSelection = useCallback((selection: GraphSelection) => {
		setGraphSelection(selection);
	}, []);

	const updateGraphState = useCallback((state: GraphState) => {
		setGraphState(state);
	}, []);

	useEffect(() => {
		if (rdfPatches.length > 0) {
			setRdfPatchesHistory(rdfPatchesHistory.concat(rdfPatches));
		}
	}, [rdfPatches]);

	const reset = () => {
		const ctx = getDefaultContext();
		setRdfPatches(ctx.rdfPatches);
		setGraphSelection(ctx.graphSelection);
		setGraphState(ctx.graphState);
		setRdfPatchesHistory(ctx.rdfPatchesHistory);
	};

	const contextValue: GraphContextData = useMemo(
		() => ({
			rdfPatches,
			dispatchRdfPatches,
			rdfPatchesHistory,
			graphSelection,
			updateGraphSelection,
			graphState,
			updateGraphState,
			reset,
		}),
		[
			rdfPatches,
			dispatchRdfPatches,
			rdfPatchesHistory,
			graphSelection,
			updateGraphSelection,
			graphState,
			updateGraphState,
		]
	);

	return <GraphContext.Provider value={contextValue}>{children}</GraphContext.Provider>;
};
