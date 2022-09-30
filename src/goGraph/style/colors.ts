export type UiTheme = {
	canvas: {
		background: string;
	};
	menu: {
		background: string;
		border: string;
		text: string;
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
		text: string;
		highlight: string;
		hover: {
			fill: string | null;
			stroke: string;
			text: string;
		};
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
	menu: {
		background: '#44403c',
		border: '#292524',
		text: '#f5f5f5',
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
		text: '#1c1917',
		highlight: '#323285',
		hover: {
			fill: '',
			stroke: 'dodgerblue',
			text: 'dodgerblue',
		},
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
		background: '#132634',
	},
	menu: {
		background: '#44403c',
		border: '#292524',
		text: '#f5f5f5',
	},
	node: {
		fill: '#243746',
		stroke: '#97CACE',
		text: '#fff',
		highlight: '#FF9200',
	},
	symbol: {
		fill: 'transparent',
		stroke: '#e7e5e4',
		text: '#e7e5e4',
		highlight: '#FF9200',
		hover: {
			fill: '',
			stroke: '#FF9200',
			text: '#FF9200',
		},
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
