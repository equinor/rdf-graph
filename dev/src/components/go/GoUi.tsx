import { useContext, useEffect, useRef, useState } from 'react';

import { RdfGraphDiagram, RdfGraphDiagramRef } from '@rdf-graph-go/RdfGraphDiagram';
import { RdfPatch } from '@rdf-graph/types/types';

import { defaultInitDiagram } from './init';
import { GraphContext } from '../../context/GraphContext';

export const GoUi = () => {
	const diagramRef = useRef<RdfGraphDiagramRef>(null);
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
			<RdfGraphDiagram
				ref={diagramRef}
				initDiagram={defaultInitDiagram}
				rdfPatches={patches}
				style={{ height: 'calc(100vh - var(--menu-height))' }}
			/>
		</div>
	);
};
