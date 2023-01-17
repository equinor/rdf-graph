import { Button, TextField } from '@equinor/eds-core-react';

import { turtleToQuads } from '@rdf-graph/core';

import { useEffect, useRef } from 'react';
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

	const clear = () => {
		if (!textAreaRef.current) return;
		textAreaRef.current.value = '';
		textAreaRef.current.focus();
	};

	useEffect(() => textAreaRef.current?.focus(), []);

	return (
		<div className={css.wrapper}>
			<TextField id="Turtle" multiline={true} textareaRef={textAreaRef} rows={30} />
			<div className={css.buttons}>
				<Button onClick={clear}>Clear</Button>
				<Button onClick={addRawTurtle}>Load Turtle</Button>
			</div>
		</div>
	);
};
