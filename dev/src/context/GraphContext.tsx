import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { GraphState, RdfPatch } from '@rdf-graph/types/core';
import { useParams } from 'react-router-dom';
import { UiKey } from '../setup';

export type GraphSelection = {
	nodes: string[];
	edges: string[];
};

export type GraphContextData = {
	rdfPatchesHistory: RdfPatch[];
	rdfPatches: RdfPatch[];
	graphSelection: GraphSelection;
	graphState: GraphState;
};

const getDefaultContext: () => GraphContextData = () => {
	return {
		rdfPatches: [],
		rdfPatchesHistory: [],
		graphSelection: { nodes: [], edges: [] },
		graphState: { nodeStore: {}, edgeStore: {}, predicateNodeStore: {} },
	};
};

type SetGraphSelectionAction = { type: 'SetGraphSelection'; selection: GraphSelection };

type DispatchRdfPatchesAction = { type: 'DispatchRdfPatches'; rdfPatches: RdfPatch[] };

type SetGraphStateAction = { type: 'SetGraphState'; graphState: GraphState };

type ResetAction = { type: 'Reset' };

type GraphContextAction =
	| SetGraphSelectionAction
	| DispatchRdfPatchesAction
	| SetGraphStateAction
	| ResetAction;

function graphContextReducer(
	state: GraphContextData,
	action: GraphContextAction
): GraphContextData {
	switch (action.type) {
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