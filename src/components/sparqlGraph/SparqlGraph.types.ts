import { LayoutOptions } from 'cytoscape';
import { GraphSelection } from '../../models/graphSelection';
import { State } from '../state/state';

export type LayoutProps = 'Cola' | 'Cose-Bilkent' | 'Dagre';

export type SparqlGraphProps = {
	state: State;
	onElementsSelected: (selection: GraphSelection) => void;
};

export type LayoutWrapper = {
	name: string;
	layout: LayoutOptions;
};

export interface UiConfigProps {
	css: React.CSSProperties;
	maxZoom: number;
	minZoom: number;
	zoom?: number;
	zoomingEnabled: boolean;
}

export class TurtleGraphError extends Error {
	constructor(msg: string) {
		super(msg);
		Object.setPrototypeOf(this, TurtleGraphError.prototype);
	}
}
