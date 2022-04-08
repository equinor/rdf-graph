export interface UiConfig {
	css?: React.CSSProperties;
	maxZoom?: number;
	minZoom?: number;
	zoom?: number;
	zoomingEnabled?: boolean;
}

export const defaultStyling: UiConfig = {
	css: { height: '100vh', width: '100%' },
	minZoom: 0.4,
	maxZoom: 2,
	zoom: undefined,
	zoomingEnabled: true,
};
