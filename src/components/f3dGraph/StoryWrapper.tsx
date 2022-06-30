import { Button } from '@equinor/eds-core-react';
import { useEffect, useState } from 'react';
import { Rdf3dGraph } from '../components';
import { useRdfActionReducer } from '../state/useRdfState';
import { turtle2RdfTriples } from '../../mapper';

export type SparqlWrapperProps = {
	turtleString: string;
};

export const StoryWrapper = ({ turtleString }: SparqlWrapperProps) => {
	const [turtle, updateTurtle] = useState<string>(turtleString);

	const loadTurtle = (): void => {
		updateTurtle(turtleString);
	};

	const [state, dispatch] = useRdfActionReducer();
	useEffect(() => {
		const quads = turtle2RdfTriples(turtleString);
		dispatch({ type: 'replace', data: quads });
	}, [turtle]);

	return (
		<div>
			<Button onClick={loadTurtle}> Load turtle </Button>
			<Rdf3dGraph {...state} onElementSelected={(something) => console.log(something)} />
		</div>
	);
};
