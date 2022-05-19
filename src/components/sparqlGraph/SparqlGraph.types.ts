import { LayoutOptions } from 'cytoscape';
import { RdfPatch } from '../../models';
import { GraphSelection } from '../../models/rdfSelection';

export type LayoutProps = 'Cola' | 'Cose-Bilkent' | 'Dagre';

export type SparqlGraphProps = {
	layoutName: LayoutProps;
	uiConfig?: UiConfigProps;
	turtleString: string;
	patches: RdfPatch[];
	onElementsSelected: (selection: GraphSelection) => void;
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
