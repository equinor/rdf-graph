export type UiKey = 'go' | 'cy' | 'fg3d';

export type RdfGraphUi = {
	name: string;
};

export const rdfGraphUis: Record<UiKey, RdfGraphUi> = {
	go: { name: 'GoJS' },
	cy: { name: 'Cytoscape' },
	fg3d: { name: '3D Force Graph' },
} as const;
