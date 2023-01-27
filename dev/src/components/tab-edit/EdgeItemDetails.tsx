import { Table } from '@equinor/eds-core-react';
import { GraphEdge } from '@rdf-graph';
import { useGraphContext } from '../../context/GraphContext';
import { RdfIri } from '../rdf-iri/RdfIri';

export const EdgeItemDetails: React.FunctionComponent<{ edge: GraphEdge }> = ({ edge }) => {
	const { graphContext } = useGraphContext();
	const predicateNode = graphContext.graphState.predicateNodeStore[edge.predicateIri];

	const props: { key: string; value: string }[] = predicateNode.props
		.filter((p) => p.type !== 'custom')
		.map((p) => {
			let val = '';
			if (p.type === 'derived') {
				val = JSON.stringify(p.value);
			} else {
				val = p.value[0];
			}

			return { key: p.key, value: val };
		});

	const propsCustom: { key: string; value: string }[] = predicateNode.props
		.filter((p) => p.type === 'custom')
		.map((p) => {
			return { key: p.key, value: (p.value as string[])[0] };
		});

	return (
		<>
			<Table>
				<Table.Head>
					<Table.Row>
						<Table.Cell>Edge</Table.Cell>
						<Table.Cell></Table.Cell>
					</Table.Row>
				</Table.Head>

				<Table.Body>
					<Table.Row>
						<Table.Cell>Id</Table.Cell>
						<Table.Cell>{edge.id}</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Cell>Type</Table.Cell>
						<Table.Cell>{edge.type}</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Cell>Predicate Iri</Table.Cell>
						<Table.Cell>
							<RdfIri iri={edge.predicateIri} />
						</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Cell>Source Id</Table.Cell>
						<Table.Cell>
							<RdfIri iri={edge.sourceId} />
						</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Cell>Target Id</Table.Cell>
						<Table.Cell>
							<RdfIri iri={edge.targetId} />
						</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table>

			{props.length > 0 ? (
				<Table>
					<Table.Head>
						<Table.Row>
							<Table.Cell>Known Property (Predicate node)</Table.Cell>
							<Table.Cell>Value</Table.Cell>
						</Table.Row>
					</Table.Head>

					<Table.Body>
						{props.map((p) => (
							<Table.Row key={p.key}>
								<Table.Cell>{p.key}</Table.Cell>
								<Table.Cell>{p.value}</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table>
			) : null}

			{propsCustom.length > 0 ? (
				<Table>
					<Table.Head>
						<Table.Row>
							<Table.Cell>Custom Property (Predicate node)</Table.Cell>
							<Table.Cell>Value</Table.Cell>
						</Table.Row>
					</Table.Head>

					<Table.Body>
						{propsCustom.map((p) => (
							<Table.Row key={p.key}>
								<Table.Cell>{p.key}</Table.Cell>
								<Table.Cell>{p.value}</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table>
			) : null}
		</>
	);
};
