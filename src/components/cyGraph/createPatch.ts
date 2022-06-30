import { DataFactory } from 'n3';
import { labelPredicate, rotationIri, rotationPredicate } from '../../mapper/predicates';
import { RdfPatch2 } from '../../models';
import { GraphSelection } from '../../models/graphModel';
import { SymbolKey } from '../../symbol-api';

const { namedNode, literal, quad } = DataFactory;

type DeleteAction = {
	type: 'deleteSelection';
	selection: GraphSelection;
};

type AddNodeAction = {
	type: 'addNode';
	iri: string;
	label: string;
};

type UpdateSelectionAction = {
	type: 'updateSelection';
	selection: GraphSelection;
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
	selection: GraphSelection;
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

export type ClientAction =
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
	| RedrawAction;

export function* createPatch(action: ClientAction): RdfPatch2 {
	switch (action.type) {
		case 'addNode':
			yield { action: 'add', assertion: quad(namedNode(action.iri), labelPredicate, literal(action.label)) };
			return;
		case 'deleteSelection':
			for (const node of action.selection) {
				for (const [predicate, value] of node.incoming) {
					for (const subject of value) {
						yield { action: 'remove', assertion: quad(namedNode(subject.id), namedNode(predicate), namedNode(node.id)) };
					}
				}

				for (const [predicate, value] of node.outgoing) {
					for (const object of value) {
						yield { action: 'remove', assertion: quad(namedNode(node.id), namedNode(predicate), namedNode(object.id)) };
					}
				}

				for (const [key, values] of node.properties) {
					for (const value of values) {
						yield { action: 'remove', assertion: quad(namedNode(node.id), namedNode(key), literal(value)) };
					}
				}
			}
			break;
		case 'rotateSelection':
			for (const node of action.selection) {
				let currentRotation = node.properties.get(rotationIri);
				if (currentRotation) {
					yield { action: 'remove', assertion: quad(namedNode(node.id), rotationPredicate, literal(currentRotation[0])) };
				} else {
					currentRotation = ['0'];
				}
				const newRotation = (parseInt(currentRotation[0]) + 90) % 360;
				yield { action: 'add', assertion: quad(namedNode(node.id), rotationPredicate, literal(newRotation.toString())) };
			}
			break;

		/* case 'updateSelection':
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
		case 'redraw':
			return { ...state, forceRedraw: state.forceRedraw + 1 };
		case 'updateUiConfig':
			return { ...state, uiConfig: { ...state.uiConfig, ...action.payload } }; */
		default:
			throw new Error(`Invalid action ${JSON.stringify(action)}`);
	}

	yield* [];
}
