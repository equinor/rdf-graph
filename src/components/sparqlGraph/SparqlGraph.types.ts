import { LayoutOptions } from 'cytoscape';
import { GraphSelection } from '../../models/graphSelection';
import { SparqlGraphState } from '../state/state';

export type LayoutProps = 'Cola' | 'Cose-Bilkent' | 'Dagre';

export type SparqlGraphProps = {
	state: SparqlGraphState;
	onElementsSelected: (selection: GraphSelection) => void;
};

export type LayoutWrapper = {
	name: string;
	layout: LayoutOptions;
};

export type EdgeStyle = 'haystack' | 'straight' | 'bezier' | 'unbundled-bezier' | 'segments' | 'taxi';

export interface UiConfigProps {
	css: React.CSSProperties;
	maxZoom: number;
	minZoom: number;
	zoom?: number;
	zoomingEnabled: boolean;
	showConnectors: boolean;
	edgeStyle: EdgeStyle;
}

export class TurtleGraphError extends Error {
	constructor(msg: string) {
		super(msg);
		Object.setPrototypeOf(this, TurtleGraphError.prototype);
	}
}
