import { LayoutOptions } from 'cytoscape';
import { RdfSelection } from '../../models/rdfSelection';

export type LayoutProps = 'Cola' | 'Cose-Bilkent' | 'Dagre';

export type SparqlGraphProps = {
	layoutName: LayoutProps;
	turtleString: string;
	onElementsSelected: (selection: RdfSelection) => void;
};

export type LayoutWrapper = {
	name: string;
	layout: LayoutOptions;
};
