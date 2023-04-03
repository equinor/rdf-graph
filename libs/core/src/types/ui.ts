import { GraphPatch } from './core';

export type RdfGraphProps<TDiagramSelectionEvent> = {
	graphPatches: GraphPatch[];
	onGraphSelectionChanged?: (selection: GraphSelection) => void;
	onSelectionChanged?: (e: TDiagramSelectionEvent) => void;
};

export type GraphSelection = {
	nodes: string[];
	edges: string[];
};

export type SelectionEffect = (selection: GraphSelection) => GraphPatch[];
