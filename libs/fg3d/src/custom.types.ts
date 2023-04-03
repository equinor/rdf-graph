export type CustomGraphNode = {
	id: string;
	color?: string;
	label?: string;
};

export type CustomGraphLink = {
	id: string;
	source: string;
	target: string;
};

export type CustomGraphStore = {
	nodes: CustomGraphNode[];
	links: CustomGraphLink[];
};
