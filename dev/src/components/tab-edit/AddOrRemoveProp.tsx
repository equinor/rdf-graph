import { Autocomplete, Button, TextField } from '@equinor/eds-core-react';
import { GraphEdge, GraphNode } from '@rdf-graph';
import { DataFactory } from 'n3';
import { useEffect, useRef, useState } from 'react';
import { useGraphContext } from '../../context/GraphContext';
import { getKnownPredicateIrisPretty, prettyIri, prettyToFullIri } from '../../rdf/rdf-utils';
import css from './TabEdit.module.css';

const { quad: q, literal: l, namedNode: n } = DataFactory;

export const AddOrRemoveProp: React.FunctionComponent<{ element: GraphNode | GraphEdge }> = ({
	element,
}) => {
	const [selectedPredicate, setSelectedPredicate] = useState<string>();
	const [selectedIriValue, setSelectedIriValue] = useState<string>();
	const [iriValueSuggestions, setIriValueSuggestions] = useState<string[]>([]);
	const [predicateSuggestions, setPredicateSuggestions] = useState<string[]>([]);
	const { graphContext, dispatch } = useGraphContext();
	const inputValueRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		updateDropdowns();
	}, []);

	useEffect(() => {
		updateDropdowns();
	}, [element]);

	function updateDropdowns() {
		setPredicateSuggestions(getKnownPredicateIrisPretty());

		setIriValueSuggestions([
			...Object.keys(graphContext.graphState.nodeStore)
				.filter((k) => k !== element.id)
				.map((iri) => prettyIri(iri)),
		]);
	}

	const dispatchProp = (action: 'add' | 'remove') => {
		const literalValue = inputValueRef.current?.value;
		const object = selectedIriValue
			? n(selectedIriValue)
			: literalValue
			? l(literalValue)
			: undefined;

		if (!selectedPredicate || !object) return;

		dispatch({
			type: 'DispatchRdfPatches',
			rdfPatches: [
				{
					action: action,
					data: q(n(element.id), n(selectedPredicate), object),
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
			<div className={css.addPropInput}>
				<Autocomplete
					onInput={onInp}
					className={css.addPropInput}
					label="Property (Predicate - IRI or custom string)"
					//initialSelectedOptions={['http://rdf.equinor.com/ui/fill']}
					options={predicateSuggestions}
					onOptionsChange={(c) => setSelectedPredicate(prettyToFullIri(c.selectedItems[0]))}
				/>
				<Autocomplete
					onInput={onInp}
					className={css.addPropInput}
					label="Value (Object - IRI)"
					//initialSelectedOptions={['http://rdf.equinor.com/ui/fill']}
					options={iriValueSuggestions}
					onOptionsChange={(c) => setSelectedIriValue(prettyToFullIri(c.selectedItems[0]))}
				/>
				<TextField inputRef={inputValueRef} id="predicateValue" label="Value (Object - Literal)" />
				<div className={css.addPropButtons}>
					<Button variant="contained" onClick={() => dispatchProp('add')}>
						Add
					</Button>
					<Button variant="contained" onClick={() => dispatchProp('remove')}>
						Remove
					</Button>
				</div>
			</div>
		</>
	);
};
