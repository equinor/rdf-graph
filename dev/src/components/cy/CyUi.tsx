import { RdfGraphDiagram } from '../../../../lib/cy/RdfGraphDiagram';
import { GraphState } from '@rdf-graph/types/core';
import { GraphSelection, useGraphContext } from '../../context/GraphContext';

export const CyUi = () => {
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
				rdfPatches={graphContext.rdfPatches}
				style={{ height: 'calc(100vh - var(--menu-height))' }}
				onGraphStateChanged={graphStateChangedHandler}
				onGraphSelectionChanged={graphSelectionChangedHandler}
			/>
		</div>
	);
};
