import { Button } from '@equinor/eds-core-react';
import { useEffect, useState } from 'react';
import { useRdfActionReducer } from '../../core/state/useRdfState';
import { turtle2RdfTriples } from '../../core/mapper';
import { Rdf3dGraph } from '../Rdf3dGraph';

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
			<Rdf3dGraph
				{...state}
				selectionEffect={(something) => {
					console.log(something);
					return [];
				}}
			/>
		</div>
	);
};
