import { Button, Chip, Divider, EdsProvider, Table, Typography } from '@equinor/eds-core-react';

import { useContext, useEffect, useState } from 'react';
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
						<Table.Cell>{p.data.subject.value}</Table.Cell>
						<Table.Cell>{p.data.predicate.value}</Table.Cell>
						<Table.Cell>{p.data.object.value}</Table.Cell>
					</Table.Row>
				))}
			</Table.Body>
		</Table>
	);
};

const MenuSection: React.FunctionComponent<React.PropsWithChildren<{ title: string }>> = ({
	title,
	children,
}) => {
	return (
		<div className={css.section}>
			<Typography variant="h5" style={{ marginBottom: '10px' }}>
				{title}
			</Typography>
			{children}
		</div>
	);
};
