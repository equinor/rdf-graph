import { Autocomplete, Button, Table, TextField, Typography } from '@equinor/eds-core-react';
import { GraphNode } from '@rdf-graph/core';
import { DataFactory } from 'n3';
import { useEffect, useRef, useState } from 'react';
import { useGraphContext } from '../../context/GraphContext';
import { getKnownIris } from '../../rdf/rdf-utils';
import css from './TabEdit.module.css';

const { quad: q, literal: l, namedNode: n } = DataFactory;

export const NodeItemDetails: React.FunctionComponent<{ node: GraphNode }> = ({ node }) => {
	const [selectedPredicate, setSelectedPredicate] = useState<string>();
	const { graphContext, dispatch } = useGraphContext();
	const inputValueRef = useRef<HTMLInputElement>(null);

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
						val = p.value[0];
					}

					return { key: p.key, value: val };
				})
		);

		setPropsCustom(
			n.props
				.filter((p) => p.type === 'custom')
				.map((p) => {
					return { key: p.key, value: (p.value as string[])[0] };
				})
		);
	}, [graphContext.graphState.nodeStore, node.id]);

	const dispatchProp = (action: 'add' | 'remove') => {
		console.log(selectedPredicate);
		const value = inputValueRef.current?.value;
		if (!value || !selectedPredicate) return;

		dispatch({
			type: 'DispatchRdfPatches',
			rdfPatches: [
				{
					action: action,
					data: q(n(node.id), n(selectedPredicate), l(value)),
				},
			],
		});
	};

	const onInp: React.FormEventHandler<HTMLDivElement> = (e) => {
		e.preventDefault();
		const value = (e.target as HTMLInputElement).value;
		setSelectedPredicate(value);
	};

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
						<Table.Cell>{node.id}</Table.Cell>
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

			<Table>
				<Table.Head>
					<Table.Row>
						<Table.Cell>Known Property</Table.Cell>
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

			<div className={css.addPropInput}>
				<Typography variant="h6">Add or Remove property</Typography>

				<Autocomplete
					onInput={onInp}
					className={css.addPropInput}
					label="Property (predicate)"
					//initialSelectedOptions={['http://rdf.equinor.com/ui/fill']}
					options={getKnownIris()}
					onOptionsChange={(c) => setSelectedPredicate(c.selectedItems[0])}
				/>
				<TextField inputRef={inputValueRef} id="predicateValue" label="Value (literal)" />
				<Button variant="contained" onClick={() => dispatchProp('add')}>
					Add
				</Button>
				<Button variant="contained" onClick={() => dispatchProp('remove')}>
					Remove
				</Button>
			</div>
		</>
	);
};
