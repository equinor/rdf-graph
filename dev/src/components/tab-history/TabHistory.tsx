import { Table } from '@equinor/eds-core-react';

import { useGraphContext } from '../../context/GraphContext';
import { RdfIri } from '../rdf-iri/RdfIri';

//import css from './TabGraphState.module.css';

export const TabHistory = () => {
	const { graphContext } = useGraphContext();

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
						<Table.Cell>
							<RdfIri iri={p.data.subject.value} singleLine={false} />
						</Table.Cell>
						<Table.Cell>
							<RdfIri iri={p.data.predicate.value} singleLine={false} />
						</Table.Cell>
						<Table.Cell>
							<RdfIri iri={p.data.object.value} singleLine={false} />
						</Table.Cell>
					</Table.Row>
				))}
			</Table.Body>
		</Table>
	);
};
