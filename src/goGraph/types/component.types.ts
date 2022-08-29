import { GraphProps } from '../../core/state/GraphStateProps';
import { GoGraphLayoutConfig } from '../layout/layout.types';

export type GoGraphOptions = {
	layout?: GoGraphLayoutConfig;
	containerStyle?: React.CSSProperties;
	theme?: 'dark' | 'light';
};

export type GoGraphProps = GraphProps & { options?: Partial<GoGraphOptions> };