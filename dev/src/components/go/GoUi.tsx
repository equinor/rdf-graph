import { useRef } from 'react';

import { RdfGoGraph, RdfGoGraphDiagramRef } from '@rdf-graph-go/RdfGoGraph';

import { defaultInitDiagram } from './init';
import { GraphSelection, useGraphContext } from '../../context/GraphContext';
import { GraphState } from '@rdf-graph/types/core';

export const GoUi = () => {
	const diagramRef = useRef<RdfGoGraphDiagramRef>(null);
	const { graphContext, dispatch } = useGraphContext();

	const graphStateChangedHandler: (state: GraphState) => void = (state) => {
		dispatch({
			type: 'SetGraphState',
			graphState: state,
		});
	};

	const graphSelectionChangedHandler: (selection: GraphSelection) => void = (selection) => {
		dispatch({
			type: 'SetGraphSelection',
			selection,
		});
		console.log('Selection:', { selection });
	};

	return (
		<div>
			<RdfGoGraph
				ref={diagramRef}
				initDiagram={() => defaultInitDiagram()}
				customGraphPatches={graphContext.customPatches}
				rdfPatches={graphContext.rdfPatches}
				style={{ height: 'calc(100vh - var(--menu-height))' }}
				onGraphStateChanged={graphStateChangedHandler}
				onGraphSelectionChanged={graphSelectionChangedHandler}
			/>
		</div>
	);
};
