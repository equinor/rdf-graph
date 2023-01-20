import { RdfCyGraph, UiSymbol } from '@rdf-graph';

import { getConnectorSymbolAdvanced, SymbolLibraryKey } from '../../symbol-api';
import { useRdfGraph } from '../../hooks/useRdfGraph';

function cySymbolProvider(id: string, rotation?: number) {
	return getConnectorSymbolAdvanced(id as SymbolLibraryKey, { rotation: rotation }) as UiSymbol;
}

export const CyUi = () => {
	const { graphPatches, graphSelectionChangedHandler } = useRdfGraph(cySymbolProvider);

	return (
		<div>
			<RdfCyGraph
				graphPatches={graphPatches}
				style={{ height: 'calc(100vh - var(--menu-height))' }}
				onGraphSelectionChanged={graphSelectionChangedHandler}
				//onSelectionChanged={}
			/>
		</div>
	);
};
