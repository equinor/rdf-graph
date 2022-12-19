import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { RdfPatch } from '@rdf-graph/types/types';

export type GraphContextData = {
	rdfPatchesHistory: RdfPatch[];
	rdfPatches: RdfPatch[];
	setRdfPatches: (rdfPatches: RdfPatch[]) => void;
};

const defaultContext: GraphContextData = {
	rdfPatches: [],
	setRdfPatches: () => {},
	rdfPatchesHistory: [],
};

export const GraphContext = createContext<GraphContextData>(defaultContext);

export const GraphContextProvider: React.FunctionComponent<React.PropsWithChildren> = ({
	children,
}) => {
	const [rdfPatches, updateRdfPatches] = useState<RdfPatch[]>(() => defaultContext.rdfPatches);
	const [rdfPatchesHistory, updateRdfPatchesHistory] = useState<RdfPatch[]>(
		() => defaultContext.rdfPatches
	);

	const setRdfPatches = useCallback((rdfPatches: RdfPatch[]) => {
		updateRdfPatches(rdfPatches);
	}, []);

	useEffect(() => {
		if (rdfPatches.length > 0) {
			updateRdfPatchesHistory(rdfPatchesHistory.concat(rdfPatches));
		}
	}, [rdfPatches]);

	const contextValue: GraphContextData = useMemo(
		() => ({
			rdfPatches,
			setRdfPatches,
			rdfPatchesHistory,
		}),
		[rdfPatches, setRdfPatches, rdfPatchesHistory]
	);

	return <GraphContext.Provider value={contextValue}>{children}</GraphContext.Provider>;
};
