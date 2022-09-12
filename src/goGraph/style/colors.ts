export type UiTheme = {
	canvas: {
		background: string;
	};
	node: {
		fill: string | null;
		stroke: string;
		text: string;
		highlight: string;
	};
	symbol: {
		fill: string | null;
		stroke: string;
		highlight: string;
	};
	link: {
		stroke: string;
		text: string;
		highlight: string;
	};
	port: {
		fill: string | null;
	};
};

export function getUiTheme(isDarkMode: boolean = false) {
	return isDarkMode ? darkModeTheme : lightModeTheme;
}

export const lightModeTheme: UiTheme = {
	canvas: {
		background: '#fafaf9',
	},
	node: {
		fill: 'lightgreen',
		stroke: '#1c1917',
		text: '#1c1917',
		highlight: '#323285',
	},
	symbol: {
		fill: 'transparent',
		stroke: '#1c1917',
		highlight: '#323285',
	},
	link: {
		stroke: '#1c1917',
		text: '',
		highlight: '#323285',
	},
	port: {
		fill: '#b91c1c',
	},
} as const;

export const darkModeTheme: UiTheme = {
	canvas: {
		background: '#1c1917',
	},
	node: {
		fill: '#fff',
		stroke: '#e7e5e4',
		text: '#e7e5e4',
		highlight: '#FF9200',
	},
	symbol: {
		fill: 'transparent',
		stroke: '#e7e5e4',
		highlight: '#FF9200',
	},
	link: {
		stroke: '#e7e5e4',
		text: '',
		highlight: '#FF9200',
	},
	port: {
		fill: '#dc2626',
	},
} as const;
