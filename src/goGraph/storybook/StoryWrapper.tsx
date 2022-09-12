import { Button } from '@equinor/eds-core-react';
import { useEffect, useState } from 'react';
import { turtle2RdfTriples } from '../../core/mapper';
import { GraphSelection, PropertyAssertion, SelectionCallback } from '../../core/types';

import { useRdfActionReducer } from '../../core/state/useRdfState';

import { RdfGoGraph } from '../RdfGoGraph';
import { getDefaultLayoutConfig, GoGraphLayout } from '../layout';
import { GoGraphOptions } from '../types/component.types';
import { getNodeSymbolTemplate, NodeSymbol } from '../../symbol-api';
import { UiNodeSymbol } from '../../core/ui/applyPatch';
import { NodeSymbolToUiNodeSymbol } from '../../core/ui/defaultSymbolProvider';

export type SparqlWrapperProps = {
	turtleString: string;
	layout: GoGraphLayout;
	selectionEffect?: SelectionCallback;
};

function symbolProvider(id: string, _rotation?: number): UiNodeSymbol | undefined {
	console.log('Using custom symbol resolver!');
	// IGNORE ROTATION for GoJS!
	const symbol = getNodeSymbolTemplate(id) as NodeSymbol;
	if (!symbol) return;
	return NodeSymbolToUiNodeSymbol(symbol);
}

export const StoryWrapper = ({ turtleString, layout, selectionEffect }: SparqlWrapperProps) => {
	const [state, dispatch] = useRdfActionReducer();
	const [turtle, updateTurtle] = useState<string>(turtleString);

	const [options, setOptions] = useState<GoGraphOptions>(() => {
		return {
			layout: getDefaultLayoutConfig(layout),
			containerStyle: { height: 'calc(100vh - 70px)' },
			showSymbolPorts: true,
		};
	});
	const [isDarkMode, setDarkMode] = useState(true);

	function handleSelection(sel: GraphSelection): PropertyAssertion[] {
		if (!selectionEffect) {
			return [];
		}
		return selectionEffect(sel);
	}

	const loadTurtle = (): void => {
		updateTurtle(turtleString);
	};

	const togglePortVisibility = (): void => {
		let v = false;
		if (options.showSymbolPorts !== undefined) v = !options.showSymbolPorts;
		setOptions({ ...options, showSymbolPorts: v });
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
			<Button onClick={loadTurtle}>Load turtle</Button>

			<Button onClick={togglePortVisibility}>{options.showSymbolPorts === true ? 'Hide' : 'Show'} Ports</Button>

			<button
				style={{ fontSize: '18px', border: 'none', background: 'transparent', cursor: 'pointer' }}
				onClick={() => setDarkMode(!isDarkMode)}>
				{isDarkMode ? '☀️' : '🌙'}
			</button>

			<RdfGoGraph options={options} selectionEffect={handleSelection} symbolProvider={symbolProvider} {...state} />
		</div>
	);
};
