import { Table } from '@equinor/eds-core-react';
import { prettyIri } from '../../rdf/rdf-utils';

import { useGraphContext } from '../../context/GraphContext';

//import css from './TabGraphState.module.css';

export const TabHistory = () => {
	const { graphContext } = useGraphContext();

	// const [canAddEdge, setCanAddEdge] = useState(false);

	// useEffect(() => {
	// 	const s = graphContext.graphSelection;

	// 	setCanAddEdge(s.nodes.length === 2 && s.edges.length === 0);
	// }, [graphContext.graphSelection]);

	return (
		<Table>
			<Table.Head>
				<Table.Row>
					<Table.Cell>#</Table.Cell>
					<Table.Cell>Action</Table.Cell>
					<Table.Cell>Subject</Table.Cell>
					<Table.Cell>Predicate</Table.Cell>
					<Table.Cell>Object</Table.Cell>
				</Table.Row>
			</Table.Head>

			<Table.Body>
				{graphContext.rdfPatchesHistory.map((p, i) => (
					<Table.Row key={i}>
						<Table.Cell>{i + 1}</Table.Cell>
						<Table.Cell>{p.action}</Table.Cell>
						<Table.Cell>{prettyIri(p.data.subject.value)}</Table.Cell>
						<Table.Cell>{prettyIri(p.data.predicate.value)}</Table.Cell>
						<Table.Cell>{prettyIri(p.data.object.value)}</Table.Cell>
					</Table.Row>
				))}
			</Table.Body>
		</Table>
	);
};
