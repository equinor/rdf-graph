import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { RdfPatch } from '@rdf-graph/types/types';

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
};

const defaultContext: GraphContextData = {
	rdfPatches: [],
	dispatchRdfPatches: () => {},
	rdfPatchesHistory: [],
	graphSelection: { nodes: [], edges: [] },
	updateGraphSelection: () => {},
};

export const GraphContext = createContext<GraphContextData>(defaultContext);

export const GraphContextProvider: React.FunctionComponent<React.PropsWithChildren> = ({
	children,
}) => {
	const [rdfPatches, setRdfPatches] = useState<RdfPatch[]>(() => defaultContext.rdfPatches);
	const [rdfPatchesHistory, setRdfPatchesHistory] = useState<RdfPatch[]>(
		() => defaultContext.rdfPatches
	);

	const [graphSelection, setGraphSelection] = useState<GraphSelection>(
		() => defaultContext.graphSelection
	);

	const dispatchRdfPatches = useCallback((rdfPatches: RdfPatch[]) => {
		setRdfPatches(rdfPatches);
	}, []);

	const updateGraphSelection = useCallback((selection: GraphSelection) => {
		setGraphSelection(selection);
	}, []);

	useEffect(() => {
		if (rdfPatches.length > 0) {
			setRdfPatchesHistory(rdfPatchesHistory.concat(rdfPatches));
		}
	}, [rdfPatches]);

	const contextValue: GraphContextData = useMemo(
		() => ({
			rdfPatches,
			dispatchRdfPatches,
			rdfPatchesHistory,
			graphSelection,
			updateGraphSelection,
		}),
		[rdfPatches, dispatchRdfPatches, rdfPatchesHistory, graphSelection, updateGraphSelection]
	);

	return <GraphContext.Provider value={contextValue}>{children}</GraphContext.Provider>;
};
