import { Autocomplete, Button, Label, TextField } from '@equinor/eds-core-react';
import { GraphEdge, GraphNode, Prop } from '@equinor/rdf-graph';
import { DataFactory } from 'n3';
import { useEffect, useRef, useState } from 'react';
import { useGraphContext } from '../../context/GraphContext';
import { getKnownPredicateIrisPretty, prettyIri, prettyToFullIri } from '../../rdf/rdf-utils';
import { RdfIri } from '../rdf-iri/RdfIri';
import css from './TabEdit.module.css';

const { quad: q, literal: l, namedNode: n } = DataFactory;

export const AddOrRemoveProp: React.FunctionComponent<{ element: GraphNode | GraphEdge }> = ({
	element,
}) => {
	const { graphContext, dispatch } = useGraphContext();
	const inputValueRef = useRef<HTMLInputElement>(null);

	const [selectedPredicate, setSelectedPredicate] = useState<string>();
	const [selectedIriValue, setSelectedIriValue] = useState<string>();
	const [iriValueSuggestions, setIriValueSuggestions] = useState<string[]>([]);
	const [predicateSuggestions, setPredicateSuggestions] = useState<string[]>([]);
	const [subject, setSubject] = useState<string>(element.id);

	useEffect(() => {
		updateDropdowns();
	}, []);

	useEffect(() => {
		updateDropdowns();
		setSubject(element.type === 'node' ? element.id : element.predicateIri);
	}, [element, graphContext.graphState]);

	function updateDropdowns() {
		let props: Prop[] | undefined;

		if (element.type === 'node') {
			props = graphContext.graphState.nodeStore[element.id]?.props;
		} else {
			props = graphContext.graphState.predicateNodeStore[element.predicateIri]?.props;
		}

		const customProps = props?.filter((p) => p.type === 'custom').map((p) => p.key) ?? [];

		setPredicateSuggestions(getKnownPredicateIrisPretty().concat(customProps));

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

		if (!subject || !selectedPredicate || !object) return;

		//const subject = element.type === 'node' ? element.id : element.predicateIri;

		dispatch({
			type: 'DispatchRdfPatches',
			rdfPatches: [
				{
					action: action,
					data: q(n(subject), n(selectedPredicate), object),
				},
			],
		});
	};

	const onPropertyInput: React.FormEventHandler<HTMLDivElement> = (e) => {
		e.preventDefault();
		const value = (e.target as HTMLInputElement).value;
		setSelectedPredicate(prettyToFullIri(value));
	};

	const onObjectIriInput: React.FormEventHandler<HTMLDivElement> = (e) => {
		e.preventDefault();
		const value = (e.target as HTMLInputElement).value;
		setSelectedIriValue(prettyToFullIri(value));
	};

	return (
		<>
			<div className={css.addPropInput}>
				<Label label="Subject" />
				<div style={{ marginLeft: '12px', height: '30px', display: 'flex', alignItems: 'center' }}>
					<RdfIri iri={subject} />
				</div>
				<Autocomplete
					onInput={onPropertyInput}
					className={css.addPropInput}
					label="Property (Predicate - IRI or custom string)"
					//initialSelectedOptions={['http://rdf.equinor.com/ui/fill']}
					options={predicateSuggestions}
					onOptionsChange={(c) => {
						if (c.selectedItems[0]) setSelectedPredicate(prettyToFullIri(c.selectedItems[0]));
					}}
				/>
				<Autocomplete
					onInput={onObjectIriInput}
					className={css.addPropInput}
					label="Value (Object - IRI)"
					//initialSelectedOptions={['http://rdf.equinor.com/ui/fill']}
					options={iriValueSuggestions}
					onOptionsChange={(c) => {
						if (c.selectedItems[0]) setSelectedIriValue(prettyToFullIri(c.selectedItems[0]));
					}}
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
