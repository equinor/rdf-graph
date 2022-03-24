import { EnvironmentsViewProps, LayoutProps } from '../../components';

export interface ChartInterfaceProps {
	isStrictMode: boolean;
	environment: EnvironmentsViewProps;
	turtle: string;
	layout?: LayoutProps;
}

export interface LayoutWrapper {
	name: CytoscapeLayout;
	layout: any;
}

export enum CytoscapeLayout {
	'Cose-Bilkent',
	'Dagre',
	'Cola',
}
