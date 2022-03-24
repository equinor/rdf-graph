import { DataType } from '../../models/data';

const fusekiEnvironments = ['localhost', 'dev', 'stid-dev', 'test', 'prod'] as const;
// export const views = ['table', 'graph', 'raw', 'progressive graph', 'empty'] as const;
export type EnvironmentViewProps = 'table' | 'graph' | 'raw' | 'progressive graph' | 'empty';
export const views = ['table', 'graph', 'raw', 'progressive graph', 'empty'] as const;
export type View = typeof views[number];

export type EnvironmentsViewProps = typeof fusekiEnvironments[number];

type StatusStateProps = 'loading' | 'ok' | 'error' | 'ready';
export type LayoutProps = 'Cola' | 'Cose-Bilkent' | 'Dagre';

export type StatusProps = {
	state: StatusStateProps;
	message: string;
};

type TransformationsDefinition = {
	name: string;
	transform: string | string[];
	checked?: boolean;
};

type SparqlQuery = {
	name: string;
	query: string;
	transformations?: TransformationsDefinition[];
	environments: EnvironmentsViewProps[] | '*';
	isStrictMode?: boolean;
};

export type SparqlGraphProps = {
	transformations: SparqlQuery['transformations'];
	layout?: LayoutProps;
	// preferredView: EnvironmentsViewProps;
	preferredView: { [key in DataType]: View };
	hasStrictMode: boolean;
	environment: EnvironmentsViewProps;
	setStatus: React.Dispatch<React.SetStateAction<StatusProps>>;
	refresh: number;
	query: string;
};
