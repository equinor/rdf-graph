import { LayoutOptions } from 'cytoscape';
import { RdfSelection } from '../../models/rdfSelection';
import { UiConfig } from '../../models/uiConfig';

export type LayoutProps = 'Cola' | 'Cose-Bilkent' | 'Dagre';

export type SparqlGraphProps = {
	layoutName: LayoutProps;
	uiConfig?: UiConfig;
	turtleString: string;
	onElementsSelected: (selection: RdfSelection) => void;
};

export type LayoutWrapper = {
	name: string;
	layout: LayoutOptions;
};
