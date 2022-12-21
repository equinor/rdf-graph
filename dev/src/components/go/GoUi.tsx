import { useContext, useEffect, useRef, useState } from 'react';

import { RdfGraphDiagram, RdfGraphDiagramRef } from '@rdf-graph-go/RdfGraphDiagram';
import { RdfPatch } from '@rdf-graph/types/types';

import { defaultInitDiagram } from './init';
import { GraphContext, GraphSelection } from '../../context/GraphContext';

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

	const selectionChangedHandler = (e: go.DiagramEvent) => {
		const selection = e.diagram.selection.toArray();
		const graphSelection = selection.reduce<GraphSelection>(
			(acc, curr) => {
				if (curr.data.type === 'node') {
					acc.nodes.push(curr.data.id);
				} else if (curr.data.type === 'edge') {
					acc.edges.push(curr.data.id);
				}
				return acc;
			},
			{ nodes: [], edges: [] }
		);

		graphCtx.updateGraphSelection(graphSelection);

		console.log('Selection:', { graphSelection });
	};

	return (
		<div>
			<RdfGraphDiagram
				ref={diagramRef}
				initDiagram={() => defaultInitDiagram(selectionChangedHandler)}
				rdfPatches={patches}
				style={{ height: 'calc(100vh - var(--menu-height))' }}
			/>
		</div>
	);
};
