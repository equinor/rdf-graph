export type LayoutProps = 'Cola' | 'Cose-Bilkent' | 'Dagre';

export type SparqlGraphProps = {
	layoutName: LayoutProps;
	turtleString: string;
};
