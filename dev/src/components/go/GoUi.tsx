import { useRef } from 'react';

import { RdfGraphDiagram, RdfGraphDiagramRef } from '@rdf-graph-go/RdfGraphDiagram';
import { GraphState } from '@rdf-graph/types/types';

import { defaultInitDiagram } from './init';
import { GraphSelection, useGraphContext } from '../../context/GraphContext';

export const GoUi = () => {
	const diagramRef = useRef<RdfGraphDiagramRef>(null);
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
			<RdfGraphDiagram
				ref={diagramRef}
				initDiagram={() => defaultInitDiagram()}
				rdfPatches={graphContext.rdfPatches}
				style={{ height: 'calc(100vh - var(--menu-height))' }}
				onGraphStateChanged={graphStateChangedHandler}
				onGraphSelectionChanged={graphSelectionChangedHandler}
			/>
		</div>
	);
};
