import { Button } from '@equinor/eds-core-react';
import { useEffect, useState } from 'react';
import { turtle2RdfTriples } from '../../core/mapper';
import { GraphSelection, PropertyAssertion, SelectionCallback } from '../../core/types';

import { useRdfActionReducer } from '../../core/state/useRdfState';

import { RdfGoGraph } from '../RdfGoGraph';
import { getDefaultLayoutConfig, GoGraphLayout } from '../layout';
import { GoGraphOptions } from '../types/component.types';

export type SparqlWrapperProps = {
	turtleString: string;
	layout: GoGraphLayout;
	selectionEffect?: SelectionCallback;
};

export const StoryWrapper = ({ turtleString, layout, selectionEffect }: SparqlWrapperProps) => {
	const [state, dispatch] = useRdfActionReducer();
	const [turtle, updateTurtle] = useState<string>(turtleString);

	const [options, setOptions] = useState<GoGraphOptions>(() => {
		return {
			layout: getDefaultLayoutConfig(layout),
			containerStyle: { height: 'calc(100vh - 70px)' },
		};
	});
	const [isDarkMode, setDarkMode] = useState(false);

	function handleSelection(sel: GraphSelection): PropertyAssertion[] {
		if (!selectionEffect) {
			//console.log('No selection handler for ', sel);
			return [];
		}
		return selectionEffect(sel);
	}

	const loadTurtle = (): void => {
		updateTurtle(turtleString);
	};

	useEffect(() => {
		const quads = turtle2RdfTriples(turtleString);
		dispatch({ type: 'replace', data: quads });
	}, [turtle]);

	useEffect(() => {
		const conf = getDefaultLayoutConfig(layout);
		setOptions({ ...options, layout: conf });
	}, [layout]);

	useEffect(() => {
		setOptions({ ...options, theme: isDarkMode ? 'dark' : 'light' });
	}, [isDarkMode]);

	return (
		<div>
			<Button onClick={loadTurtle}> Load turtle </Button>

			<button
				style={{ fontSize: '18px', border: 'none', background: 'transparent', cursor: 'pointer' }}
				onClick={() => setDarkMode(!isDarkMode)}>
				{isDarkMode ? '☀️' : '🌙'}
			</button>

			<RdfGoGraph options={options} selectionEffect={handleSelection} {...state} />
		</div>
	);
};
