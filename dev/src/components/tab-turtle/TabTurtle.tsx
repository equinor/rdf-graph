import { Button, TextField } from '@equinor/eds-core-react';

import { turtleToQuads } from '@rdf-graph/turtleToQuads';

import { useRef } from 'react';
import { useGraphContext } from '../../context/GraphContext';

import css from './TabTurtle.module.css';

export const TabTurtle = () => {
	const { dispatch } = useGraphContext();

	const textAreaRef = useRef<HTMLTextAreaElement>(null);

	const addRawTurtle = () => {
		if (!textAreaRef.current) return;
		dispatch({
			type: 'DispatchRdfPatches',
			rdfPatches: turtleToQuads(textAreaRef.current.value).map((q) => {
				return { action: 'add', data: q };
			}),
		});
	};

	return (
		<div className={css.wrapper}>
			<TextField id="Turtle" multiline={true} textareaRef={textAreaRef} rows={30} />
			<Button onClick={addRawTurtle}>Load Turtle</Button>
		</div>
	);
};
