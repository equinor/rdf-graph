import { LayoutProps } from '../../components';

export interface ChartInterfaceProps {
	turtleString: string;
	layoutName: LayoutProps;
}

export interface LayoutWrapper {
	name: LayoutProps;
	layout: any;
}
