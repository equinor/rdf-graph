import { RdfCyGraph } from '../../../../lib/cy/RdfCyGraph';
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
	};

	return (
		<div>
			<RdfCyGraph
				rdfPatches={graphContext.rdfPatches}
				customGraphPatches={graphContext.customPatches}
				style={{ height: 'calc(100vh - var(--menu-height))' }}
				onGraphStateChanged={graphStateChangedHandler}
				onGraphSelectionChanged={graphSelectionChangedHandler}
			/>
		</div>
	);
};
