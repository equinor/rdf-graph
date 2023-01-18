import { RdfF3dGraph, GraphState } from '@rdf-graph';

import { GraphSelection, useGraphContext } from '../../context/GraphContext';

export const F3dUi = () => {
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
	};

	return (
		<div>
			<RdfF3dGraph
				rdfPatches={graphContext.rdfPatches}
				customGraphPatches={graphContext.customPatches}
				onGraphStateChanged={graphStateChangedHandler}
				onGraphSelectionChanged={graphSelectionChangedHandler}
			/>
		</div>
	);
};
