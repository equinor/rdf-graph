import { Button, Chip, Divider, EdsProvider, Typography } from '@equinor/eds-core-react';

import { useContext, useEffect, useState } from 'react';
import { useGraphContext } from '../../context/GraphContext';

import css from './TabGraphState.module.css';

export const TabGraphState = () => {
	const { graphContext } = useGraphContext();

	const [canAddEdge, setCanAddEdge] = useState(false);

	useEffect(() => {
		const s = graphContext.graphSelection;

		setCanAddEdge(s.nodes.length === 2 && s.edges.length === 0);
	}, [graphContext.graphSelection]);

	return (
		<div className={css.json}>
			<pre style={{ color: 'black', fontSize: '12', padding: '5px' }}>
				{JSON.stringify(graphContext.graphState, undefined, 2)}
			</pre>
		</div>
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
