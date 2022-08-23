export type UiTheme = {
	canvas: {
		background: string;
	};
	node: {
		fill: string | null;
		stroke: string;
		text: string;
		hover: {
			fill: string | null;
			stroke: string;
			text: string;
		};
	};
	link: {
		stroke: string;
		text: string;
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
		text: '#000',
		hover: {
			fill: 'RebeccaPurple',
			stroke: 'lightgreen',
			text: '#fff',
		},
	},
	link: {
		stroke: '#1c1917',
		text: '',
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
		text: '#000',
		hover: {
			fill: 'RebeccaPurple',
			stroke: '#fff',
			text: '#fff',
		},
	},
	link: {
		stroke: '#e7e5e4',
		text: '',
	},
	port: {
		fill: '#dc2626',
	},
};
