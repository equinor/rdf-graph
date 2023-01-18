import { useRef } from 'react';

import { defaultInitDiagram } from './init';
import { GraphSelection, useGraphContext } from '../../context/GraphContext';
import { getConnectorSymbol, SymbolLibraryKey } from '../../symbol-api';

import { GraphState, RdfGoGraph, RdfGoGraphDiagramRef, UiSymbol } from '@rdf-graph';

function goSymbolProvider(id: string, _rotation?: number) {
	return getConnectorSymbol(id as SymbolLibraryKey) as UiSymbol;
}

export const GoUi = () => {
	const diagramRef = useRef<RdfGoGraphDiagramRef>(null);
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
			<RdfGoGraph
				ref={diagramRef}
				initDiagram={() => defaultInitDiagram()}
				symbolProvider={goSymbolProvider}
				customGraphPatches={graphContext.customPatches}
				rdfPatches={graphContext.rdfPatches}
				style={{ height: 'calc(100vh - var(--menu-height))' }}
				onGraphStateChanged={graphStateChangedHandler}
				onGraphSelectionChanged={graphSelectionChangedHandler}
			/>
		</div>
	);
};
