import { RdfF3dGraph } from '@rdf-graph/f3d/RdfF3dGraph';
import { GraphState, UiSymbol } from '@rdf-graph/core';
import { GraphSelection, useGraphContext } from '../../context/GraphContext';
import { getConnectorSymbolAdvanced, SymbolLibraryKey } from '../../symbol-api';

export const F3dUi = () => {
	const { graphContext, dispatch } = useGraphContext();

	function fg3SymbolProvider(id: string, rotation?: number) {
		return getConnectorSymbolAdvanced(id as SymbolLibraryKey, { rotation: rotation }) as UiSymbol;
	}

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
				symbolProvider={fg3SymbolProvider}
				onGraphStateChanged={graphStateChangedHandler}
				onGraphSelectionChanged={graphSelectionChangedHandler}
			/>
		</div>
	);
};
