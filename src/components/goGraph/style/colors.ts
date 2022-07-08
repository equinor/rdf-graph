export type UiTheme = {
	canvas: {
		background: string;
	};
	node: {
		fill: string | null;
		stroke: string;
		text: string;
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
		fill: '',
		stroke: '#1c1917',
		text: '',
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
		fill: null,
		stroke: '#e7e5e4',
		text: '',
	},
	link: {
		stroke: '#e7e5e4',
		text: '',
	},
	port: {
		fill: '#dc2626',
	},
};
