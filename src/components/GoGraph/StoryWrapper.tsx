import { Button } from '@equinor/eds-core-react';
import { useEffect, useState } from 'react';
// import { colorPredicate, hasSvgPredicate } from '../../mapper/predicates';
// import { GraphSelection } from '../../models';
// import { getData } from '../../cytoscape-api/cytoscapeApi';
// import { SymbolKey } from '../../symbol-api';
import { RdfGoGraph } from '../components';
import { useRdfActionReducer } from '../state/useRdfState';
import { turtle2RdfTriples } from '../../mapper';
// import { reducer } from '../state/reducer';
// import { initState } from '../state/state';
// import { EdgeStyle } from './SparqlGraph.types';

export type SparqlWrapperProps = {
	turtleString: string;
};

// const colors = ['blue', 'green', 'red', 'yellow', 'purple', 'pink', 'cyan', 'grey'];
// const edgeStyles: EdgeStyle[] = ['haystack', 'straight', 'bezier', 'unbundled-bezier', 'segments', 'taxi'];
// const svgs = [SymbolKey.Separator_1, SymbolKey.Valve_3Way_1];

export const StoryWrapper = ({ turtleString }: SparqlWrapperProps) => {
	const [turtle, updateTurtle] = useState<string>(turtleString);
	// const [nodeNumber, setNodeNumber] = useState<number>(1);
	// const [state, dispatch] = useReducer(reducer, initState);

	// const deleteSelection = () => {
	// 	dispatch({ type: 'deleteSelection' });
	// };

	// const rotateSelection = () => {
	// 	dispatch({ type: 'rotateSelection' });
	// };

	// const switchSvg = () => {
	// 	if (state.graphSelection.individuals.length > 0) {
	// 		const current = state.graphSelection.individuals[0];
	// 		const symbolId = getData(current, hasSvgPredicate.value);
	// 		if (!symbolId) {
	// 			dispatch({ type: 'switchSvg', payload: { svgKey: svgs[0] } });
	// 		} else {
	// 			const index = svgs.indexOf(symbolId as SymbolKey);
	// 			const newIndex = (index + 1) % svgs.length;
	// 			dispatch({ type: 'switchSvg', payload: { svgKey: svgs[newIndex] } });
	// 		}
	// 	}
	// };
	// const changeColor = () => {
	// 	if (state.graphSelection.individuals.length > 0) {
	// 		const current = state.graphSelection.individuals[0];
	// 		const currentColor = getData(current, colorPredicate.value);
	// 		const index = colors.indexOf(currentColor ?? 'grey');
	// 		const newColorIndex = (index + 1) % colors.length;
	// 		const newColor = colors[newColorIndex];
	// 		dispatch({ type: 'changeColor', payload: { color: newColor, ids: state.graphSelection.individuals.map((i) => i.id) } });
	// 	}
	// };

	// const changeEdgeStyle = () => {
	// 	const currentEdge = state.uiConfig.edgeStyle;
	// 	const index = edgeStyles.indexOf(currentEdge ?? 'haystack');
	// 	const newEdgeIndex = (index + 1) % edgeStyles.length;
	// 	const newEdgeStyle = edgeStyles[newEdgeIndex];
	// 	dispatch({ type: 'updateUiConfig', payload: { ...state.uiConfig, edgeStyle: newEdgeStyle } });
	// };

	// const addNode = () => {
	// 	const iri = 'http://example.com/node' + nodeNumber;
	// 	const label = 'node' + nodeNumber;

	// 	dispatch({ type: 'addNode', payload: { iri: iri, label: label } });
	// 	setNodeNumber((n) => n + 1);
	// };

	// const connect = () => {
	// 	if (state.graphSelection.individuals.length === 2) {
	// 		const node1 = state.graphSelection.individuals[0].id;
	// 		const node2 = state.graphSelection.individuals[1].id;

	// 		const exampleConnectedPredicate = 'http://example.com/connected';

	// 		dispatch({ type: 'connect', payload: { subject: node1, predicate: exampleConnectedPredicate, object: node2 } });
	// 	}
	// };

	// const onElementsSelected = (selection: GraphSelection): void => {
	// 	dispatch({ type: 'updateSelection', payload: selection });
	// };

	const loadTurtle = (): void => {
		updateTurtle(turtleString);
	};

	// const toggleConnectors = (): void => {
	// 	dispatch({ type: 'updateUiConfig', payload: { ...state.uiConfig, showConnectors: !state.uiConfig.showConnectors } });
	// };

	//	dispatch({type: 'updateTurtle', payload: {turtle: turtleString}});
	const [state, dispatch] = useRdfActionReducer();
	useEffect(() => {
		const quads = turtle2RdfTriples(turtleString);
		dispatch({ type: 'replace', data: quads });
	}, [turtle]);
	return (
		<div>
			{/* <Button onClick={deleteSelection}> Delete </Button>
			<Button onClick={rotateSelection}> Rotate </Button>
			<Button onClick={switchSvg}> Switch svg </Button>
			<Button onClick={connect}> Connect </Button>
			<Button onClick={addNode}> Add </Button>
			<Button onClick={changeColor}> Color </Button> */}
			<Button onClick={loadTurtle}> Load turtle </Button>
			{/* <Button onClick={changeEdgeStyle}> Change Edge Style </Button>
			<Button onClick={toggleConnectors}> Toggle Connectors </Button> */}

			<RdfGoGraph {...state} />

			{/* <F3DGraphView /> */}
		</div>
	);
};
