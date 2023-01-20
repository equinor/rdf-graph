import { RdfF3dGraph } from '@rdf-graph';
import { useRdfGraph } from '../../hooks/useRdfGraph';

export const F3dUi = () => {
	const { graphPatches, graphSelectionChangedHandler } = useRdfGraph();

	return (
		<RdfF3dGraph
			graphPatches={graphPatches}
			onGraphSelectionChanged={graphSelectionChangedHandler}
		/>
	);
};
