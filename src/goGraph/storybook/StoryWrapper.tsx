import { Button } from '@equinor/eds-core-react';
import { useEffect, useRef, useState } from 'react';
import { turtle2RdfTriples } from '../../core/mapper';
import { GraphSelection, PropertyAssertion, SelectionCallback } from '../../core/types';

import { useRdfActionReducer } from '../../core/state/useRdfState';

import { RdfGoGraph } from '../RdfGoGraph';

import { getConnectorSymbol, SymbolLibraryKey } from '../../symbol-api';
import { UiNodeSymbol } from '../../core/ui/applyPatch';
import { ConnectorSymbolToUiNodeSymbol } from '../../core/ui/defaultSymbolProvider';
import { defaultInitDiagram } from '../components/goGraph/defaultInit';

export type GoStoryWrapperProps = {
	turtleString: string;
	selectionEffect?: SelectionCallback;
};

function symbolProviderJson(id: string, _rotation?: number): UiNodeSymbol | undefined {
	// IGNORE ROTATION for GoJS!
	const symbol = getConnectorSymbol(id as SymbolLibraryKey);
	if (!symbol) return;
	return ConnectorSymbolToUiNodeSymbol(symbol);
}

const diagramStyle: React.CSSProperties = {
	height: 'calc(100vh - 70px)',
	width: '100%',
	overflow: 'hidden',
	background: '#fafaf9',
};

export const StoryWrapper = ({ turtleString, selectionEffect }: GoStoryWrapperProps) => {
	const [state, dispatch] = useRdfActionReducer();
	const [turtle, updateTurtle] = useState<string>(turtleString);
	const [showSymbolPorts, setShowSymbolPorts] = useState(true);

	const diagramRef = useRef<go.Diagram>(defaultInitDiagram());

	function handleSelection(sel: GraphSelection): PropertyAssertion[] {
		if (!selectionEffect) return [];
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
		const { model } = diagramRef.current;
		model.setDataProperty(model.modelData, 'portOpacity', showSymbolPorts ? 1 : 0);
	}, [showSymbolPorts]);

	return (
		<div>
			<Button onClick={loadTurtle}>Load turtle</Button>
			<Button onClick={() => setShowSymbolPorts(!showSymbolPorts)}>{showSymbolPorts === true ? 'Hide' : 'Show'} Ports</Button>

			<RdfGoGraph
				{...state}
				diagramInitializer={() => diagramRef.current}
				containerStyle={diagramStyle}
				symbolProvider={symbolProviderJson}
				selectionEffect={handleSelection}
			/>
		</div>
	);
};
