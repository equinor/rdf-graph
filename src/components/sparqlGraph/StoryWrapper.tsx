import { Button } from '@equinor/eds-core-react';
import { useState } from 'react';
import { RdfPatch, RdfSelection, RdfTriple } from '../../models';
import { SparqlGraph } from './SparqlGraph';
import { LayoutProps } from './SparqlGraph.types';

export type SparqlWrapperProps = {
	turtleString: string;
	layoutName: LayoutProps;
};

export const StoryWrapper = ({ turtleString, layoutName }: SparqlWrapperProps) => {
	const dummyNode = 'NewNode';
	const colors = ['blue', 'green', 'red', 'yellow', 'purple', 'pink', 'cyan', 'grey'];

	const [selection, setSelection] = useState<RdfSelection>(new RdfSelection([], []));

	const [patches, setPatches] = useState<Array<RdfPatch>>([]);

	const deleteSelection = () => {
		const newPatch = new RdfPatch({ tripleRemovals: selection.rdfTriple, individualRemovals: selection.individuals });
		let newPatches = [...patches, newPatch];
		setPatches(newPatches);
	};

	const onElementsSelected = (selection: RdfSelection): void => {
		setSelection(selection);
		if (selection.individuals.length > 0) {
			const selectedNode = selection.individuals[0].iri;
			let newPatch: RdfPatch;
			if (selectedNode === dummyNode) {
				const randomColor = colors[Math.floor(Math.random() * colors.length)];
				newPatch = new RdfPatch({ tripleAdditions: [new RdfTriple(selectedNode, 'http://rdf.equinor.com/ui/color', randomColor)] });
			} else {
				newPatch = new RdfPatch({
					tripleAdditions: [
						new RdfTriple(selectedNode, 'NewPredicate', 'NewNode'),
						new RdfTriple('NewNode', 'http://www.w3.org/2000/01/rdf-schema#label', 'New cool node. Tap for random color'),
					],
				});
			}
			let newPatches = [...patches, newPatch];
			setPatches(newPatches);
		}
	};

	return (
		<div>
			<Button onClick={deleteSelection}> Delete selection </Button>
			<SparqlGraph turtleString={turtleString} layoutName={layoutName} patches={patches} onElementsSelected={onElementsSelected} />
		</div>
	);
};
