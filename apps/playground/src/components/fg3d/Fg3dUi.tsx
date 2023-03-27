import { RdfFg3dGraph } from '@equinor/rdf-graph-fg3d';

import { useRdfGraph } from '../../hooks/useRdfGraph';

export const Fg3dUi = () => {
	const { graphPatches, graphSelectionChangedHandler } = useRdfGraph();

	return (
		<RdfFg3dGraph
			graphPatches={graphPatches}
			onGraphSelectionChanged={graphSelectionChangedHandler}
		/>
	);
};
