import { useContext, useEffect, useState } from 'react';
import { RdfPatch } from '@rdf-graph/types/types';
import { GraphContext } from '../../context/GraphContext';

export const CyUi = () => {
	const [patches, setPatches] = useState<RdfPatch[]>([]);
	const [hasInit, setHasInit] = useState<boolean>(false);

	const graphCtx = useContext(GraphContext);

	useEffect(() => {
		if (graphCtx.rdfPatchesHistory.length > 0) {
			setPatches(graphCtx.rdfPatchesHistory);
		}
		setHasInit(true);
	}, []);

	useEffect(() => {
		if (!hasInit) return;
		setPatches(graphCtx.rdfPatches);
	}, [graphCtx.rdfPatches]);

	return (
		<div>
			<h1>TODO: Cytoscape</h1>
			<p>Patch count (history): {graphCtx.rdfPatchesHistory.length}</p>
		</div>
	);
};
