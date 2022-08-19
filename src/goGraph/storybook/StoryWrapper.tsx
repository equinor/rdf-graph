import { Button } from '@equinor/eds-core-react';
import { useEffect, useState } from 'react';
import { turtle2RdfTriples } from '../../core/mapper';
import { GraphSelection, PropertyAssertion, SelectionCallback } from '../../core/types';

import { useRdfActionReducer } from '../../core/state/useRdfState';
import { GraphLayouts, LayoutProps } from '../types/layout.types';
import { getDefaultLayout } from '../layout/default-layouts';
import { RdfGoGraph } from '../RdfGoGraph';

export type SparqlWrapperProps = {
	turtleString: string;
	layout: GraphLayouts;
	selectionEffect?: SelectionCallback;
};

export const StoryWrapper = ({ turtleString, layout, selectionEffect }: SparqlWrapperProps) => {
	const [state, dispatch] = useRdfActionReducer();
	const [turtle, updateTurtle] = useState<string>(turtleString);

	const [options, setOptions] = useState<LayoutProps>();

	function handleSelection(sel: GraphSelection): PropertyAssertion[] {
		if (!selectionEffect) {
			console.log('No selection handler for ', sel);
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

			<RdfGoGraph options={options} selectionEffect={handleSelection} {...state} />
		</div>
	);
};
