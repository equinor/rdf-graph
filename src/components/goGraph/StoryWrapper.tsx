import { Button } from '@equinor/eds-core-react';
import { useEffect, useState } from 'react';
import { GraphSelection } from '../../models';
import { RdfGoGraph } from '../components';
import { useRdfActionReducer } from '../state/useRdfState';
import { turtle2RdfTriples } from '../../mapper';

export type SparqlWrapperProps = {
	turtleString: string;
};

export const StoryWrapper = ({ turtleString }: SparqlWrapperProps) => {
	const [state, dispatch] = useRdfActionReducer();
	const [turtle, updateTurtle] = useState<string>(turtleString);

	const handleSelection = (selection: GraphSelection) => {
		console.log('Selection: ', { selection });
	};

	const loadTurtle = (): void => {
		updateTurtle(turtleString);
	};

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

			<RdfGoGraph onElementSelected={handleSelection} {...state} />
		</div>
	);
};
