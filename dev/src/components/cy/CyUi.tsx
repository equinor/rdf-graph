import { RdfPatch } from '@rdf-graph/types/core';
import { useEffect, useState } from 'react';
import { useGraphContext } from '../../context/GraphContext';

export const CyUi = () => {
	const [patches, setPatches] = useState<RdfPatch[]>([]);
	const [hasInit, setHasInit] = useState<boolean>(false);

	const { graphContext } = useGraphContext();

	useEffect(() => {
		if (graphContext.rdfPatchesHistory.length > 0) {
			setPatches(graphContext.rdfPatchesHistory);
		}
		setHasInit(true);
	}, []);

	useEffect(() => {
		if (!hasInit) return;
		setPatches(graphContext.rdfPatches);
	}, [graphContext.rdfPatches]);

	return (
		<div>
			<h1>TODO: Cytoscape</h1>
			<p>Patch count (history): {graphContext.rdfPatchesHistory.length}</p>
		</div>
	);
};
