import { Button } from '@equinor/eds-core-react';
import { useEffect, useState } from 'react';
import { turtle2RdfTriples } from '../../../mapper';
import { GraphSelection } from '../../../models';
import { RdfGoGraph } from '../../components';

import { useRdfActionReducer } from '../../state/useRdfState';
import { GoGraphLayoutType, GoGraphOptions } from '../GoGraph.types';
import { getDefaultLayout } from '../layout/default-layouts';

export type SparqlWrapperProps = {
	turtleString: string;
	layout: GoGraphLayoutType;
};

export const StoryWrapper = ({ turtleString, layout }: SparqlWrapperProps) => {
	const [state, dispatch] = useRdfActionReducer();
	const [turtle, updateTurtle] = useState<string>(turtleString);

	const [options, setOptions] = useState<GoGraphOptions>();

	const [selection, setSelection] = useState<GraphSelection>([]);

	function handleSelection(sel: GraphSelection) {
		setSelection(sel);
	}

	const loadTurtle = (): void => {
		updateTurtle(turtleString);
	};

	useEffect(() => {
		const quads = turtle2RdfTriples(turtleString);
		dispatch({ type: 'replace', data: quads });
	}, [turtle]);

	useEffect(() => {
		console.log('Got selection from GoGraph:', selection);
	}, [selection]);

	useEffect(() => {
		const lay = getDefaultLayout(layout);
		setOptions({ ...options, layout: lay });
	}, [layout]);

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

			<RdfGoGraph options={options} onElementSelected={handleSelection} {...state} />
		</div>
	);
};
