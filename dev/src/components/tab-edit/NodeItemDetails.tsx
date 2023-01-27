import { Table } from '@equinor/eds-core-react';
import { GraphNode } from '@rdf-graph';

import { useEffect, useState } from 'react';
import { useGraphContext } from '../../context/GraphContext';
import { RdfIri } from '../rdf-iri/RdfIri';
//import css from './TabEdit.module.css';

export const NodeItemDetails: React.FunctionComponent<{ node: GraphNode }> = ({ node }) => {
	const { graphContext } = useGraphContext();

	const [props, setProps] = useState<{ key: string; value: string }[]>([]);
	const [propsCustom, setPropsCustom] = useState<{ key: string; value: string }[]>([]);

	useEffect(() => {
		const n = graphContext.graphState.nodeStore[node.id];
		if (!n) return;
		setProps(
			n.props
				.filter((p) => p.type !== 'custom')
				.map((p) => {
					let val = '';
					if (p.type === 'derived') {
						val = JSON.stringify(p.value);
					} else {
						val = JSON.stringify(p.value); //p.value[0];
					}

					return { key: p.key, value: val };
				})
		);

		setPropsCustom(
			n.props
				.filter((p) => p.type === 'custom')
				.map((p) => {
					return { key: p.key, value: JSON.stringify(p.value) }; //(p.value as string[])[0] };
				})
		);
	}, [graphContext.graphState.nodeStore, node.id]);

	return (
		<>
			<Table>
				<Table.Head>
					<Table.Row>
						<Table.Cell>Node</Table.Cell>
						<Table.Cell></Table.Cell>
					</Table.Row>
				</Table.Head>

				<Table.Body>
					<Table.Row>
						<Table.Cell>Id</Table.Cell>
						<Table.Cell>
							<RdfIri iri={node.id} />
						</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Cell>Type</Table.Cell>
						<Table.Cell>{node.type}</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Cell>Variant</Table.Cell>
						<Table.Cell>{node.variant}</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table>

			{props.length > 0 ? (
				<Table>
					<Table.Head>
						<Table.Row>
							<Table.Cell>Known Property</Table.Cell>
							<Table.Cell>Value (Raw)</Table.Cell>
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
							<Table.Cell>Custom Property</Table.Cell>
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
