import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query'

import { defaultInitDiagram } from './init';
import { getConnectorSymbol, SymbolLibraryKey } from '../../symbol-api';

import { GraphPatch, GraphSelection, UiSymbol } from '@equinor/rdf-graph';
import { RdfGoGraph, RdfGoGraphDiagramRef } from '@equinor/rdf-graph-go';
import { useRdfGraph } from '../../hooks/useRdfGraph';
import { fetchAllSymbols } from '../../symbol-api/api';

function hardCodedSymbolProvider(id: string, _rotation?: number) {
	return getConnectorSymbol(id as SymbolLibraryKey) as UiSymbol;
}


export const GoUi = () => {
	const { status, data: symbols, error, isFetching } = useQuery<UiSymbol[]>({
		queryKey:['symbols'],
		queryFn: fetchAllSymbols
	});

	const gpRef = useRef<GraphPatch[]>();
	const gcRef = useRef<((selection: GraphSelection) => void)>();

	const apiSymbolProvider = (id: string, _rotation?: number) => {
		if (!symbols) {
			console.warn("Symbols have not been loaded");
			return;
		}
		console.log("Trying to find symbol with id " + id + " among " + symbols.map(s => s.id).join(", "));
		return symbols.find(s => s.id === id);
	}
	const { graphPatches, graphSelectionChangedHandler } = useRdfGraph(apiSymbolProvider);

	gpRef.current = graphPatches;
	gcRef.current = graphSelectionChangedHandler;
	const diagramRef = useRef<RdfGoGraphDiagramRef>(null);

	return (
			<>
				{isFetching && <h2>"loading..."</h2> }
				{symbols && <RdfGoGraph
					ref={diagramRef}
					initDiagram={() => defaultInitDiagram()}
					graphPatches={gpRef.current}
					style={{ height: 'calc(100vh - var(--menu-height))' }}
					onGraphSelectionChanged={gcRef.current}
				//onSelectionChanged={() => {}}
				/>}
			</>
	);
};
