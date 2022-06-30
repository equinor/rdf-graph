import { Button } from '@equinor/eds-core-react';
import { useEffect, useState } from 'react';
import { RdfCyGraph } from '../components';
import { useRdfActionReducer } from '../state/useRdfState';
import { turtle2RdfTriples } from '../../mapper';
import { createPatch } from './createPatch';
import { GraphSelection } from '../../models/graphModel';

export type SparqlWrapperProps = {
	turtleString: string;
};

export const StoryWrapper = ({ turtleString }: SparqlWrapperProps) => {
	const [turtle, updateTurtle] = useState<string>(turtleString);
	const [nodeNumber, setNodeNumber] = useState<number>(1);

	const [selection, setSelection] = useState<GraphSelection>([]);
	const [state, dispatch] = useRdfActionReducer();

	const deleteSelection = () => {
		const patch = [...createPatch({ type: 'deleteSelection', selection })];
		dispatch({ type: 'patch', data: patch });
	};

	const rotateSelection = () => {
		const patch = [...createPatch({ type: 'rotateSelection', selection })];
		dispatch({ type: 'patch', data: patch });
	};

	const addNode = () => {
		const patch = createPatch({ type: 'addNode', iri: 'http://example.com/node' + nodeNumber, label: 'node' + nodeNumber });
		dispatch({ type: 'patch', data: patch });
		setNodeNumber((n) => n + 1);
	};

	const loadTurtle = (): void => {
		updateTurtle(turtleString);
	};

	const handleSelection = (selection: GraphSelection) => {
		setSelection(selection);
	};

	useEffect(() => {
		const quads = turtle2RdfTriples(turtleString);
		dispatch({ type: 'replace', data: quads });
	}, [turtle]);
	return (
		<div>
			<Button onClick={addNode}> Add </Button>
			<Button onClick={deleteSelection}> Delete </Button>
			<Button onClick={rotateSelection}> Rotate </Button>
			<Button onClick={loadTurtle}> Load turtle </Button>
			<RdfCyGraph onElementSelected={handleSelection} {...state} />
		</div>
	);
};
