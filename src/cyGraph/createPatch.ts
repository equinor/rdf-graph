import { DataFactory } from 'n3';
import { labelPredicate, rotationIri, rotationPredicate } from '../core/mapper/predicates';
import { RdfAssertion, RdfPatch2 } from '../core/types';
import { GraphElementBase, GraphNode, GraphSelection } from '../core/types/graphModel';

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
	payload: { svgKey: string };
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
	type: 'connectSelection';
	predicate: string;
	selection: GraphSelection;
};

type AddPropertyAction = {
	type: 'addProperty';
	key: string;
	value: string;
	selection: GraphSelection;
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
	| AddPropertyAction
	| RotateSelection
	| RedrawAction;

export function* createPatch(action: ClientAction): RdfPatch2 {
	switch (action.type) {
		case 'addNode':
			yield {
				action: 'add',
				assertion: quad(namedNode(action.iri), labelPredicate, literal(action.label)),
			};
			return;
		case 'deleteSelection':
			for (const element of action.selection as GraphElementBase[]) {
				for (const [predicate, value] of element.incoming) {
					for (const subject of value) {
						yield {
							action: 'remove',
							assertion: quad(namedNode(subject.id), namedNode(predicate), namedNode(element.id)),
						};
					}
				}

				for (const [predicate, value] of element.outgoing) {
					for (const edgy of value) {
						yield {
							action: 'remove',
							assertion: quad(
								namedNode(element.id),
								namedNode(predicate),
								namedNode(edgy.targetRef.id)
							),
						};
					}
				}

				for (const [key, values] of element.properties) {
					for (const value of values) {
						yield {
							action: 'remove',
							assertion: quad(namedNode(element.id), namedNode(key), literal(value)),
						};
					}
				}
			}
			break;
		case 'rotateSelection':
			for (const node of action.selection as GraphElementBase[]) {
				let currentRotation = node.properties.get(rotationIri);
				if (currentRotation) {
					yield {
						action: 'remove',
						assertion: quad(namedNode(node.id), rotationPredicate, literal(currentRotation[0])),
					};
				} else {
					currentRotation = ['0'];
				}
				const newRotation = (parseInt(currentRotation[0]) + 90) % 360;
				yield {
					action: 'add',
					assertion: quad(namedNode(node.id), rotationPredicate, literal(newRotation.toString())),
				};
			}
			break;

		case 'addProperty':
			for (const node of action.selection.filter((s) => s.type === 'node') as GraphNode[]) {
				const assertion: RdfAssertion = {
					action: 'add',
					assertion: quad(namedNode(node.id), namedNode(action.key), literal(action.value)),
				};
				yield assertion;
			}
			break;

		case 'connectSelection':
			const nodesToConnect = action.selection.filter((s) => s.type === 'node') as GraphNode[];
			for (const node1 of action.selection.filter((s) => s.type === 'node') as GraphNode[]) {
				for (const node2 of nodesToConnect) {
					if (node1 !== node2) {
						yield {
							action: 'add',
							assertion: quad(
								namedNode(node1.id),
								namedNode(action.predicate),
								namedNode(node2.id)
							),
						};
					}
				}
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
		
		case 'redraw':
			return { ...state, forceRedraw: state.forceRedraw + 1 };
		case 'updateUiConfig':
			return { ...state, uiConfig: { ...state.uiConfig, ...action.payload } }; */
		default:
			throw new Error(`Invalid action ${JSON.stringify(action)}`);
	}

	yield* [];
}
