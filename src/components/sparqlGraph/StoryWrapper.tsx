import { Button } from '@equinor/eds-core-react';
import { useState } from 'react';
import { RdfPatch, RdfSelection, RdfTriple } from '../../models';
import { SymbolKey } from '../../symbol-api/symbol-library';
import { SparqlGraph } from './SparqlGraph';
import { LayoutProps } from './SparqlGraph.types';

export type SparqlWrapperProps = {
	turtleString: string;
	layoutName: LayoutProps;
};

type State = {
	rotation: number;
};
type States = { [iri: string]: State };

export const StoryWrapper = ({ turtleString, layoutName }: SparqlWrapperProps) => {
	const dummyNode = 'NewNode';
	const colors = ['blue', 'green', 'red', 'yellow', 'purple', 'pink', 'cyan', 'grey'];

	const [selection, setSelection] = useState<RdfSelection>(new RdfSelection([], []));

	const [patches, setPatches] = useState<Array<RdfPatch>>([]);

	const [states, setStates] = useState<States>({});

	const deleteSelection = () => {
		const newPatch = new RdfPatch({ tripleRemovals: selection.rdfTriple, individualRemovals: selection.individuals });
		let newPatches = [...patches, newPatch];
		setPatches(newPatches);
	};

	const rotateSelection = () => {
		if (selection.individuals.length > 0) {
			const index = selection.individuals[0].iri;
			let rotation = 90;

			if (states[index]) {
				rotation = ((states[index].rotation / 90 + 1) % 4) * 90;
			} else {
				setStates({ [index]: { rotation: rotation }, ...states });
			}

			console.log('ROTATING', rotation);
			addTriples([new RdfTriple(selection.individuals[0].iri, 'http://rdf.equinor.com/ui/rotation', rotation.toString())]);
		}
	};

	const addTriples = (triples: RdfTriple[]): void => {
		const newPatch = new RdfPatch({
			tripleAdditions: triples,
		});
		let newPatches = [...patches, newPatch];
		setPatches(newPatches);
	};

	const onElementsSelected = (selection: RdfSelection): void => {
		setSelection(selection);
	};

	return (
		<div>
			<Button onClick={deleteSelection}> Delete selection </Button>
			<Button onClick={rotateSelection}> Rotate selection </Button>
			<SparqlGraph turtleString={turtleString} layoutName={layoutName} patches={patches} onElementsSelected={onElementsSelected} />
		</div>
	);
};
