import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { GraphPatch, GraphState, N3QuadStore, RdfPatch } from '@equinor/rdf-graph';
import { useParams } from 'react-router-dom';
import { UiKey } from '../setup';

export type GraphSelection = {
	nodes: string[];
	edges: string[];
};

export type GraphContextData = {
	rdfPatchesHistory: RdfPatch[];
	rdfPatches: RdfPatch[];
	customPatches: GraphPatch[];
	graphSelection: GraphSelection;
	graphState: GraphState;
	quadStore?: N3QuadStore;
};

const getDefaultContext: () => GraphContextData = () => {
	return {
		rdfPatches: [],
		rdfPatchesHistory: [],
		graphSelection: { nodes: [], edges: [] },
		graphState: { nodeStore: {}, edgeStore: {}, predicateNodeStore: {} },
		customPatches: [],
		quadStore: undefined,
	};
};

type SetGraphSelectionAction = { type: 'SetGraphSelection'; selection: GraphSelection };

type DispatchRdfPatchesAction = { type: 'DispatchRdfPatches'; rdfPatches: RdfPatch[] };
type DispatchCustomGraphPatchesAction = {
	type: 'DispatchCustomGraphPatches';
	graphPatches: GraphPatch[];
};

type SetGraphStateAction = { type: 'SetGraphState'; graphState: GraphState };

type SetQuadStoreAction = { type: 'SetQuadStore'; quadStore: N3QuadStore };

type ResetAction = { type: 'Reset' };

type GraphContextAction =
	| DispatchCustomGraphPatchesAction
	| SetGraphSelectionAction
	| DispatchRdfPatchesAction
	| SetGraphStateAction
	| SetQuadStoreAction
	| ResetAction;

function graphContextReducer(
	state: GraphContextData,
	action: GraphContextAction
): GraphContextData {
	switch (action.type) {
		case 'DispatchCustomGraphPatches':
			return {
				...state,
				customPatches: action.graphPatches,
			};
		case 'DispatchRdfPatches':
			return {
				...state,
				rdfPatches: action.rdfPatches,
				rdfPatchesHistory: [...state.rdfPatchesHistory, ...action.rdfPatches],
			};
		case 'SetGraphSelection':
			return { ...state, graphSelection: action.selection };
		case 'SetGraphState':
			return { ...state, graphState: action.graphState };
		case 'SetQuadStore':
			return { ...state, quadStore: action.quadStore };
		case 'Reset':
			return getDefaultContext();
		default:
			return state;
	}
}

const GraphContext = createContext<GraphContextValue>(null!);

type GraphContextValue = {
	graphContext: GraphContextData;
	dispatch: React.Dispatch<GraphContextAction>;
};

export const GraphContextProvider: React.FunctionComponent<React.PropsWithChildren> = ({
	children,
}) => {
	const [graphContext, dispatch] = useReducer(graphContextReducer, getDefaultContext());

	const { ui } = useParams<{ ui: UiKey }>();

	const contextValue: GraphContextValue = {
		graphContext,
		dispatch,
	};

	useEffect(() => {
		if (graphContext.rdfPatchesHistory.length === 0) return;
		const history = [...graphContext.rdfPatchesHistory];
		dispatch({ type: 'Reset' });
		dispatch({ type: 'DispatchRdfPatches', rdfPatches: history });
	}, [ui]);

	return <GraphContext.Provider value={contextValue}>{children}</GraphContext.Provider>;
};

export function useGraphContext() {
	return useContext(GraphContext);
}
