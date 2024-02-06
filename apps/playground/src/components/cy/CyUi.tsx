import { UiSymbol } from '@equinor/rdf-graph';
import { RdfCyGraph } from '@equinor/rdf-graph-cy';

import { getConnectorSymbolAdvanced, SymbolLibraryKey } from '../../symbol-api';
import { useRdfGraph } from '../../hooks/useRdfGraph';
import { useEngineeringSymbols } from '../../hooks/useEngineeringSymbols';

function cySymbolProvider(id: string, rotation?: number) {
	return getConnectorSymbolAdvanced(id as SymbolLibraryKey, { rotation: rotation }) as UiSymbol;
}

export const CyUi = () => {
	const { symbolProvider } = useEngineeringSymbols();
	const { graphPatches, graphSelectionChangedHandler } = useRdfGraph(symbolProvider);

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
