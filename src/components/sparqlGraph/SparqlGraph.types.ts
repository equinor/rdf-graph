import { LayoutOptions } from 'cytoscape';
import { RdfSelection } from '../../models/rdfSelection';

export type LayoutProps = 'Cola' | 'Cose-Bilkent' | 'Dagre';

export type SparqlGraphProps = {
	layoutName: LayoutProps;
	uiConfig?: UiConfigProps;
	turtleString: string;
	onElementsSelected: (selection: RdfSelection) => void;
};

export type LayoutWrapper = {
	name: string;
	layout: LayoutOptions;
};

export interface UiConfigProps {
	css?: React.CSSProperties;
	maxZoom?: number;
	minZoom?: number;
	zoom?: number;
	zoomingEnabled?: boolean;
}
