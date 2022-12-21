import { Button, Chip, Divider, EdsProvider, Typography } from '@equinor/eds-core-react';

import { DataFactory } from 'n3';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

import { useContext, useEffect, useState } from 'react';
import { GraphContext } from '../../context/GraphContext';

import css from './TabEdit.module.css';

import { PROPS } from '@rdf-graph/types/types';

import { pages } from '../../main';

const { quad: q, literal: l, namedNode: n } = DataFactory;

function generateNodeName() {
	return uniqueNamesGenerator({
		dictionaries: [adjectives, animals],
		length: 2,
	});
}

export const TabEdit = () => {
	const graphCtx = useContext(GraphContext);

	const [canAddEdge, setCanAddEdge] = useState(false);

	const addNewNode = (id?: string) => {
		const shortName = generateNodeName();
		const shortName2 = generateNodeName();

		graphCtx.dispatchRdfPatches([
			{
				action: 'add',
				data: q(n('http://example.com/animals/' + shortName), n(PROPS.label.iri), l(shortName)),
			},
			// {
			// 	action: 'add',
			// 	data: q(
			// 		n('http://example.com/animals/' + shortName),
			// 		n('connectedTo'),
			// 		n('http://example.com/animals/' + shortName2)
			// 	),
			// },
			// {
			// 	action: 'add',
			// 	data: q(n('http://example.com/animals/' + shortName2), n(PROPS.label.iri), l(shortName2)),
			// },
			// {
			// 	action: 'add',
			// 	data: q(n('http://example.com/animals/' + shortName2), n(PROPS.fill.iri), l('red')),
			// },
		]);
	};

	const addEdge = () => {
		if (!canAddEdge) return;
		addEdgeFromIris(graphCtx.graphSelection.nodes[0], graphCtx.graphSelection.nodes[1]);
	};

	const addEdgeFromIris = (sourceIri: string, targetIri: string) => {
		graphCtx.dispatchRdfPatches([
			{
				action: 'add',
				data: q(n(sourceIri), n('connectedTo'), n(targetIri)),
			},
		]);
	};

	useEffect(() => {
		const s = graphCtx.graphSelection;

		setCanAddEdge(s.nodes.length === 2 && s.edges.length === 0);
	}, [graphCtx.graphSelection]);

	return (
		<EdsProvider density="compact">
			<div className={css.wrapper}>
				<MenuSection title="Selection">
					<div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
						<Chip>{graphCtx.graphSelection.nodes.length} nodes </Chip>
						<Chip>{graphCtx.graphSelection.edges.length} edges </Chip>
					</div>
				</MenuSection>
				<Divider variant="small" style={{ width: '100%' }} />
				<MenuSection title="Node">
					<Button onClick={() => addNewNode()}>Add Node</Button>
				</MenuSection>
				<Divider variant="small" style={{ width: '100%' }} />
				<MenuSection title="Edge">
					{canAddEdge ? (
						<Typography variant="h5" style={{ marginBottom: '10px' }}>
							CAN
						</Typography>
					) : (
						<Typography variant="h5" style={{ marginBottom: '10px' }}>
							Select exactly two nodes
						</Typography>
					)}
					<Button onClick={() => addEdge()} disabled={!canAddEdge}>
						Add Edge
					</Button>
				</MenuSection>
			</div>
		</EdsProvider>
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
