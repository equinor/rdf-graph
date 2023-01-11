import { GraphState, RdfPatch } from './core';
import { RdfGraphError } from './RdfGraphError';
import { UiSymbolProvider } from './UiSymbol';

export type RdfGraphProps<TDiagramSelectionEvent> = {
	style?: React.CSSProperties;
	rdfPatches: RdfPatch[];
	symbolProvider?: UiSymbolProvider;
	onErrorCallback?: (error: RdfGraphError) => void;
	onGraphStateChanged?: (state: GraphState) => void;
	onGraphSelectionChanged?: (selection: GraphSelection) => void;
	onSelectionChanged?: (e: TDiagramSelectionEvent) => void;
};

export type GraphSelection = {
	nodes: string[];
	edges: string[];
};
