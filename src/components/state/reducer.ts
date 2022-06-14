import { DataFactory, Quad } from 'n3';
import { getAllQuads, getData } from '../../cytoscape-api/cytoscapeApi';
import {
	colorPredicate,
	hasConnectorPredicate,
	hasConnectorSuffixPredicate,
	hasSvgPredicate,
	labelPredicate,
	rotationPredicate,
} from '../../mapper/predicates';
import { emptyPatch, GraphSelection, RdfPatch } from '../../models';
import { getSymbol, SymbolKey } from '../../symbol-api';
import { UiConfigProps } from '../sparqlGraph/SparqlGraph.types';
import { SparqlGraphState } from './state';

const { namedNode, literal, quad } = DataFactory;

type DeleteAction = {
	type: 'deleteSelection';
};

type AddNodeAction = {
	type: 'addNode';
	payload: { iri: string; label: string };
};

type UpdateSelectionAction = {
	type: 'updateSelection';
	payload: GraphSelection;
};

type UpdateTurtleAction = {
	type: 'updateTurtle';
	payload: { turtle: string };
};

type SwitchSvgAction = {
	type: 'switchSvg';
	payload: { svgKey: SymbolKey };
};

type RotateSelection = {
	type: 'rotateSelection';
};

type ChangeDataAction = {
	type: 'changeData';
	payload: { predicate: string; value: string; ids: string[] };
};

type ChangeColorAction = {
	type: 'changeColor';
	payload: { color: string; ids: string[] };
};

type ChangeLabelAction = {
	type: 'changeLabel';
	payload: { label: string; id: string };
};

type ConnectAction = {
	type: 'connect';
	payload: { subject: string; predicate: string; object: string };
};

type RedrawAction = {
	type: 'redraw';
};

type UpdateUiConfigAction = {
	type: 'updateUiConfig';
	payload: UiConfigProps;
};

export type SparqlGraphAction =
	| DeleteAction
	| UpdateSelectionAction
	| AddNodeAction
	| UpdateTurtleAction
	| SwitchSvgAction
	| ChangeColorAction
	| ChangeLabelAction
	| ChangeDataAction
	| ConnectAction
	| RotateSelection
	| RedrawAction
	| UpdateUiConfigAction;

export const reducer = (state: SparqlGraphState, action: SparqlGraphAction): SparqlGraphState => {
	switch (action.type) {
		case 'addNode':
			const patch = addTriples([quad(namedNode(action.payload.iri), labelPredicate, literal(action.payload.label))]);
			return { ...state, patches: [...state.patches, patch] };
		case 'deleteSelection':
			const removals = state.graphSelection.individuals.flatMap((node) => getAllQuads(node)).concat(state.graphSelection.edges);
			return createNewPatchState(state, [], removals);
		case 'updateSelection':
			return { ...state, graphSelection: action.payload };
		case 'updateTurtle':
			return { ...state, turtleString: action.payload.turtle, patches: [], resetCounter: state.resetCounter + 1 };
		case 'switchSvg':
			return createNewState(state, switchSvg(state.graphSelection, action.payload.svgKey));
		case 'changeColor':
			return createNewState(state, updateData(action.payload.ids, colorPredicate.value, action.payload.color));
		case 'changeLabel':
			return createNewState(state, updateData([action.payload.id], labelPredicate.value, action.payload.label));
		case 'changeData':
			return createNewState(state, updateData(action.payload.ids, action.payload.predicate, action.payload.value));
		case 'connect':
			return createNewPatchState(state, [
				quad(namedNode(action.payload.subject), namedNode(action.payload.predicate), namedNode(action.payload.object)),
			]);
		case 'rotateSelection':
			return createNewState(state, rotateSelection(state.graphSelection));
		case 'redraw':
			return { ...state, forceRedraw: state.forceRedraw + 1 };
		case 'updateUiConfig':
			return { ...state, uiConfig: { ...state.uiConfig, ...action.payload } };
		default:
			throw new Error(`Invalid action ${JSON.stringify(action)}`);
	}
};

const updateData = (subjectIds: string[], predicate: string, value: string) =>
	addTriples(subjectIds.map((s) => quad(namedNode(s), namedNode(predicate), literal(value))));

const switchSvg = (selection: GraphSelection, symbolKey: SymbolKey): RdfPatch => {
	if (selection.individuals.length > 0) {
		const current = selection.individuals[0];
		const symbolId = getData(current, hasSvgPredicate.value);
		const currentIri = namedNode(current.id);
		if (!symbolId) {
			return convertToSvg(selection, symbolKey);
		} else {
			return addTriples([quad(currentIri, hasSvgPredicate, literal(symbolKey.toString()))]);
		}
	}
	return emptyPatch;
};

const convertToSvg = (selection: GraphSelection, symbolKey: SymbolKey): RdfPatch => {
	const current = selection.individuals[0];
	const node = current;
	const nodeId = current.id;
	const n3Node = namedNode(nodeId);
	const symbol = getSymbol(symbolKey);

	let additions = [quad(n3Node, hasSvgPredicate, literal(symbol.id))];
	let removals: Quad[] = [];
	let incomingCounter = 0;
	let outgoingCounter = 0;

	for (let i = 0; i < symbol.connectors.length; i++) {
		const n3Connector = namedNode(nodeId + 'connector' + i);
		const connectorSuffix = literal(symbol.connectors[i].id);

		if (incomingCounter < node.rdfIncoming.length) {
			const pair = node.rdfIncoming[incomingCounter];
			additions.push(quad(namedNode(pair.value), namedNode(pair.key), n3Connector));
			removals.push(quad(namedNode(pair.value), namedNode(pair.key), namedNode(nodeId)));
			incomingCounter++;
		} else if (outgoingCounter < node.rdfOutgoing.length) {
			const pair = node.rdfOutgoing[outgoingCounter];
			additions.push(quad(n3Connector, namedNode(pair.key), namedNode(pair.value)));
			removals.push(quad(namedNode(nodeId), namedNode(pair.key), namedNode(pair.value)));
			outgoingCounter++;
		}

		additions.push(quad(n3Node, hasConnectorPredicate, n3Connector));
		additions.push(quad(n3Connector, hasConnectorSuffixPredicate, connectorSuffix));
	}
	const newPatch = new RdfPatch({
		tripleAdditions: additions,
		tripleRemovals: removals,
	});

	return newPatch;
};

const rotateSelection = (selection: GraphSelection) => {
	if (selection.individuals.length > 0) {
		const current = selection.individuals[0];
		const currentIri = namedNode(current.id);
		const currentRotation = parseInt(getData(current, rotationPredicate.value) ?? '0');
		const newRotation = ((currentRotation / 90 + 1) % 4) * 90;

		return new RdfPatch({
			tripleAdditions: [quad(currentIri, rotationPredicate, literal(newRotation.toString()))],
			tripleRemovals: [],
		});
	}
	return emptyPatch;
};

const createNewPatchState = (state: SparqlGraphState, additions: Quad[], removals: Quad[] = []): SparqlGraphState => {
	return createNewState(state, new RdfPatch({ tripleAdditions: additions, tripleRemovals: removals }));
};

const createNewState = (state: SparqlGraphState, patch: RdfPatch): SparqlGraphState => {
	return {
		...state,
		patches: [...state.patches, patch],
	};
};

const addTriples = (triples: Quad[]): RdfPatch => {
	return new RdfPatch({
		tripleAdditions: triples,
		tripleRemovals: [],
	});
};
