import { SparqlGraphProps } from './SparqlGraph.types';
import { ChartInterface } from '../../interface/chart';

export const SparqlGraph = ({ turtleString, layoutName }: SparqlGraphProps) => {
	return <ChartInterface turtleString={turtleString} layoutName={layoutName} />;
};
