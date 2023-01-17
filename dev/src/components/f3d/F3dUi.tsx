import { RdfF3dGraph } from '../../../../lib/f3d/RdfF3dGraph';
import { GraphState } from '@rdf-graph/types/core';
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
				style={{ height: 'calc(100vh - var(--menu-height))', width:  'calc(100vw - var(--side-menu-width))'}}
				onGraphStateChanged={graphStateChangedHandler}
				onGraphSelectionChanged={graphSelectionChangedHandler}
			/>
		</div>
	);
};
