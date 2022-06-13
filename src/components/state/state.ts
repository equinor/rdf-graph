import { RdfPatch } from '../../models';
import { GraphSelection } from '../../models/graphSelection';
import { LayoutProps } from '../sparqlGraph';
import { UiConfigProps } from '../sparqlGraph/SparqlGraph.types';

export const initState: State = {
	graphSelection: new GraphSelection([], []),
	turtleString: '',
	patches: [],
	layoutName: 'Dagre',
	uiConfig: {
		css: { height: '100vh', width: '100%' },
		minZoom: 0.4,
		maxZoom: 2,
		zoom: undefined,
		zoomingEnabled: true,
		showConnectors: true,
		edgeStyle: 'taxi',
	},
	resetCounter: 0,
	forceRedraw: 0,
};

export type State = {
	graphSelection: GraphSelection;
	turtleString: string;
	patches: RdfPatch[];
	layoutName: LayoutProps;
	uiConfig: UiConfigProps;

	resetCounter: number;
	forceRedraw: number;
};
