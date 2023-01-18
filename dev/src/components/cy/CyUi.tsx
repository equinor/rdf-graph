//import { GraphState, RdfCyGraph, UiSymbol } from '@equinor/rdf-graph';
import { GraphState, UiSymbol, RdfCyGraph } from '@rdf-graph';
import { GraphSelection, useGraphContext } from '../../context/GraphContext';
import { getConnectorSymbolAdvanced, SymbolLibraryKey } from '../../symbol-api';

function cySymbolProvider(id: string, rotation?: number) {
	return getConnectorSymbolAdvanced(id as SymbolLibraryKey, { rotation: rotation }) as UiSymbol;
}

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
				symbolProvider={cySymbolProvider}
				customGraphPatches={graphContext.customPatches}
				style={{ height: 'calc(100vh - var(--menu-height))' }}
				onGraphStateChanged={graphStateChangedHandler}
				onGraphSelectionChanged={graphSelectionChangedHandler}
			/>
		</div>
	);
};
