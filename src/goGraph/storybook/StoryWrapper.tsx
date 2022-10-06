import { Button } from '@equinor/eds-core-react';
import { useEffect, useRef, useState } from 'react';
import { turtle2RdfTriples } from '../../core/mapper';
import { GraphSelection, PropertyAssertion, SelectionCallback } from '../../core/types';

import { useRdfActionReducer } from '../../core/state/useRdfState';

import { RdfGoGraph } from '../RdfGoGraph';
import { getDefaultLayoutConfig, GoGraphLayout } from '../layout';
import { GoGraphOptions } from '../types/component.types';
import { getConnectorSymbol, SymbolLibraryKey } from '../../symbol-api';
import { UiNodeSymbol } from '../../core/ui/applyPatch';
import { ConnectorSymbolToUiNodeSymbol } from '../../core/ui/defaultSymbolProvider';
import { defaultInitDiagram } from '../components/goGraph/defaultInit';

export type SparqlWrapperProps = {
	turtleString: string;
	layout: GoGraphLayout;
	selectionEffect?: SelectionCallback;
};

function symbolProviderJson(id: string, _rotation?: number): UiNodeSymbol | undefined {
	// IGNORE ROTATION for GoJS!
	const symbol = getConnectorSymbol(id as SymbolLibraryKey);
	if (!symbol) return;
	return ConnectorSymbolToUiNodeSymbol(symbol);
}

export const StoryWrapper = ({ turtleString, layout, selectionEffect }: SparqlWrapperProps) => {
	const [state, dispatch] = useRdfActionReducer();
	const [turtle, updateTurtle] = useState<string>(turtleString);
	const [showSymbolPorts, setShowSymbolPorts] = useState(true);

	const diagramRef = useRef<go.Diagram>(defaultInitDiagram());

	const [options, setOptions] = useState<GoGraphOptions>(() => {
		return {
			layout: getDefaultLayoutConfig(layout),
			containerStyle: { height: 'calc(100vh - 70px)' },
			showSymbolPorts: true,
			diagramInitializer: defaultInitDiagram,
		} as GoGraphOptions;
	});

	const [diagramStyle, setDiagramStyle] = useState<React.CSSProperties>(() => {
		return {
			height: '100vh',
			width: '100%',
			// border: '1px solid lightgrey',
			overflow: 'hidden',
			//background: getUiTheme(isDarkMode).canvas.background,
			// transition: 'background 0.1s ease',
		};
	});

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
		const conf = getDefaultLayoutConfig(layout);
		setOptions({ ...options, layout: conf });
	}, [layout]);

	useEffect(() => {
		if (!layout) return;

		switch (layout) {
			case GoGraphLayout.ForceDirected:
				setPortDirection(false);
				break;
			case GoGraphLayout.LayeredDigraph:
				setPortDirection(true);
				break;
			default:
				break;
		}

		diagramRef.current.layout = getLayout(layout);
	}, [layout]);

	useEffect(() => {
		const { model } = diagramRef.current;
		model.setDataProperty(model.modelData, 'portOpacity', showSymbolPorts ? 1 : 0);
	}, [showSymbolPorts]);

	return (
		<div style={{ height: '400px', width: '100%' }}>
			<Button onClick={loadTurtle}>Load turtle</Button>

			<Button onClick={() => setShowSymbolPorts(!showSymbolPorts)}>{showSymbolPorts === true ? 'Hide' : 'Show'} Ports</Button>

			{/* <button
				style={{ fontSize: '18px', border: 'none', background: 'transparent', cursor: 'pointer' }}
				onClick={() => setDarkMode(!isDarkMode)}>
				{isDarkMode ? '☀️' : '🌙'}
			</button> */}

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
