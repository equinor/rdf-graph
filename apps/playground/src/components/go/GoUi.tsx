import { useRef } from 'react';
import { defaultInitDiagram } from './init';
import { getConnectorSymbol, SymbolLibraryKey } from '../../symbol-api';

import { UiSymbol } from '@equinor/rdf-graph';
import { RdfGoGraph, RdfGoGraphDiagramRef } from '@equinor/rdf-graph-go';
import { useRdfGraph } from '../../hooks/useRdfGraph';
import { useEngineeringSymbols } from '../../hooks/useEngineeringSymbols';

function _hardCodedSymbolProvider(id: string, _rotation?: number) {
	return getConnectorSymbol(id as SymbolLibraryKey) as UiSymbol;
}

export const GoUi = () => {
	const { symbolProvider } = useEngineeringSymbols();
	const { graphPatches, graphSelectionChangedHandler } = useRdfGraph(symbolProvider);
	const diagramRef = useRef<RdfGoGraphDiagramRef>(null);

	return (
		<RdfGoGraph
			ref={diagramRef}
			initDiagram={() => defaultInitDiagram()}
			graphPatches={graphPatches}
			style={{ height: 'calc(100vh - var(--menu-height))' }}
			onGraphSelectionChanged={graphSelectionChangedHandler}
			//onSelectionChanged={() => {}}
		/>
	);
};
