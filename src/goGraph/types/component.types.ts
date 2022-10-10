import { GraphProps } from '../../core/state/GraphStateProps';

export type GoGraphOptions = {
	containerStyle?: React.CSSProperties;
	diagramInitializer?: () => go.Diagram;
	onModelChange?: (event: go.IncrementalData) => void;
};

export type GoGraphProps = GraphProps & Partial<GoGraphOptions>;
