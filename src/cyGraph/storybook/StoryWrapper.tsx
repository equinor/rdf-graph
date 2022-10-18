import { Button, Input, Table } from '@equinor/eds-core-react';
import { useEffect, useState } from 'react';
import { useRdfActionReducer } from '../../core/state/useRdfState';
import { turtle2RdfTriples } from '../../core/mapper';
import { createPatch } from '../createPatch';
import { GraphSelection } from '../../core/types/graphModel';
import { RdfCyGraph } from '../RdfCyGraph';
import { DataFactory } from 'n3';
import { ConnectorSymbolToUiNodeSymbol } from '../../core/ui/defaultSymbolProvider';
import { getConnectorSymbolAdvanced, SymbolLibraryKey } from '../../symbol-api';
import { UiNodeSymbol } from '../../core/ui/applyPatch';

const { namedNode } = DataFactory;

export type SparqlWrapperProps = {
	turtleString: string;
};

type Property = {
	key: string;
	value: string;
};

export function cySymbolProvider(id: string, rotation?: number): UiNodeSymbol | undefined {
	const symbol = getConnectorSymbolAdvanced(id as SymbolLibraryKey, {
		rotation: rotation,
		mutateConnectorRelativePosition: 'CenterCenter',
		mutateSvgStringOnRotation: true,
		mutateConnectorRelativePositionOnRotation: true,
	});
	if (!symbol) return;

	return ConnectorSymbolToUiNodeSymbol(symbol);
}

export const StoryWrapper = ({ turtleString }: SparqlWrapperProps) => {
	const [turtle, updateTurtle] = useState<string>(turtleString);

	const [selection, setSelection] = useState<GraphSelection>([]);
	const [state, dispatch] = useRdfActionReducer();

	const [nodeIri, setNodeIri] = useState<string>('');
	const [connectionPredicate, setConnectionPredicate] = useState<string>('');

	const [valuePredicate, setValuePredicate] = useState<string>('http://rdf.equinor.com/ui/');
	const [literalValue, setLiteralValue] = useState<string>('');
	const [properties, setProperties] = useState<Property[]>([]);

	const deleteSelection = () => {
		const patch = [...createPatch({ type: 'deleteSelection', selection })];
		dispatch({ type: 'patch', data: patch });
		setSelection([]);
	};

	const rotateSelection = () => {
		const patch = [...createPatch({ type: 'rotateSelection', selection })];
		dispatch({ type: 'patch', data: patch });
	};

	const connectSelection = () => {
		const patch = [
			...createPatch({
				type: 'connectSelection',
				predicate: connectionPredicate,
				selection,
			}),
		];
		dispatch({ type: 'patch', data: patch });
	};

	const addNode = () => {
		if (nodeIri) {
			const patch = createPatch({
				type: 'addNode',
				iri: nodeIri,
				label: nodeIri,
			});
			dispatch({ type: 'patch', data: patch });
		}
	};

	const loadTurtle = (): void => {
		updateTurtle(turtleString);
	};

	const addProperty = (): void => {
		const patch = [
			...createPatch({
				type: 'addProperty',
				key: valuePredicate,
				value: literalValue,
				selection: selection,
			}),
		];
		dispatch({ type: 'patch', data: patch });
	};

	const handleSelection = (newSelection: GraphSelection) => {
		const nodes = newSelection.filter((s) => s.type === 'node');
		setSelection(newSelection);

		if (newSelection.length !== 1 || !nodes[0]) {
			setProperties([]);
			return [];
		}
		const quads = state.rdfStore.match(namedNode(nodes[0].id), null, null);
		let props: Property[] = [];
		for (const q of quads) {
			if (q.object.termType === 'Literal') {
				props.push({ key: q.predicate.value, value: q.object.value });
			}
		}
		setProperties(props);
		return [];
	};

	useEffect(() => {
		const quads = turtle2RdfTriples(turtleString);
		dispatch({ type: 'replace', data: quads });
	}, [turtle]);

	const handleConnectionPredicateSelect = (e: React.SyntheticEvent<HTMLInputElement, Event>) => {
		setConnectionPredicate(e.currentTarget.value);
	};

	const handleNodeIdSelect = (e: React.SyntheticEvent<HTMLInputElement, Event>) => {
		setNodeIri(e.currentTarget.value);
	};

	const handleValuePredicateSelect = (e: React.SyntheticEvent<HTMLInputElement, Event>) => {
		setValuePredicate(e.currentTarget.value);
	};

	const handleValueSelect = (e: React.SyntheticEvent<HTMLInputElement, Event>) => {
		setLiteralValue(e.currentTarget.value);
	};

	return (
		<div>
			<Button onClick={addNode}> Add </Button>
			<Input onChange={(x) => handleNodeIdSelect(x)} />
			<Button onClick={deleteSelection}> Delete </Button>
			<Button onClick={rotateSelection}> Rotate </Button>
			<Button onClick={connectSelection}> Connect </Button>
			<Input onChange={(x) => handleConnectionPredicateSelect(x)} />
			<Button onClick={loadTurtle}> Load turtle </Button>
			<RdfCyGraph selectionEffect={handleSelection} symbolProvider={cySymbolProvider} {...state} />
			<Table>
				<Table.Head>
					<Table.Row key="Details">
						<Table.Cell key="subject">subject</Table.Cell>
						<Table.Cell key="predicate">predicate</Table.Cell>
						<Table.Cell key="object">object</Table.Cell>
					</Table.Row>
				</Table.Head>
				<Table.Body>
					{properties.map(({ key, value }, row_index) => (
						<Table.Row key={`result_row${row_index}`}>
							{' '}
							<Table.Cell key={`result_cell${row_index}_subject`}> {selection[0]?.id} </Table.Cell>
							<Table.Cell key={`result_cell${row_index}_predicate`}> {key} </Table.Cell>
							<Table.Cell key={`result_cell${row_index}_object`}> {value} </Table.Cell>
						</Table.Row>
					))}
					<Table.Row key={`add`}>
						{' '}
						<Table.Cell key={`result_cell_add_button`}>
							{' '}
							<Button onClick={addProperty} />
						</Table.Cell>
						<Table.Cell key={`result_cell_add_predicate`}>
							<Input onChange={(x) => handleValuePredicateSelect(x)} value={valuePredicate} />
						</Table.Cell>
						<Table.Cell key={`result_cell_add_object`}>
							<Input onChange={(x) => handleValueSelect(x)} />
						</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table>
		</div>
	);
};
