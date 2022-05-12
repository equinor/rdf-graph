import { Button } from '@equinor/eds-core-react';
import { useState } from 'react';
import { RdfPatch, RdfSelection, RdfTriple } from '../../models';
import { getSymbol } from '../../symbol-api/getSymbol';
import { SymbolKey } from '../../symbol-api/symbol-library';
import { SparqlGraph } from './SparqlGraph';
import { LayoutProps } from './SparqlGraph.types';

export type SparqlWrapperProps = {
	turtleString: string;
	layoutName: LayoutProps;
};

const colors = ['blue', 'green', 'red', 'yellow', 'purple', 'pink', 'cyan', 'grey'];
const svgs = [SymbolKey.Separator_1, SymbolKey.Valve_3Way_1];

export const StoryWrapper = ({ turtleString, layoutName }: SparqlWrapperProps) => {
	const [selection, setSelection] = useState<RdfSelection>(new RdfSelection([], []));

	const [patches, setPatches] = useState<Array<RdfPatch>>([]);

	const [nodeNumber, setNodeNumber] = useState<number>(1);

	const deleteSelection = () => {
		const newPatch = new RdfPatch({ tripleRemovals: selection.rdfTriple, individualRemovals: selection.individuals });
		let newPatches = [...patches, newPatch];
		setPatches(newPatches);
	};

	const rotateSelection = () => {
		if (selection.individuals.length > 0) {
			const index = selection.individuals[0].iri;
			const data = selection.individuals[0].data;
			console.log('data', data);
			const currentRotation = parseInt(data.rotation ?? '0');
			const newRotation = ((currentRotation / 90 + 1) % 4) * 90;

			addTriples([new RdfTriple(index, 'http://rdf.equinor.com/ui/rotation', newRotation.toString())]);
		}
	};

	const switchSvg = () => {
		if (selection.individuals.length > 0) {
			const symbolId = selection.individuals[0].data.symbolId;
			if (!symbolId) {
				convertToSvg();
			} else {
				const index = svgs.indexOf(symbolId);
				const newIndex = (index + 1) % svgs.length;
				addTriples([new RdfTriple(selection.individuals[0].iri, 'http://rdf.equinor.com/ui/hasSvg', svgs[newIndex].toString())]);
			}
		}
	};

	const convertToSvg = () => {
		if (selection.individuals.length > 0) {
			const node = selection.individuals[0];
			const nodeId = selection.individuals[0].iri;
			const symbolId = svgs[0];
			const symbol = getSymbol(symbolId);

			let additions = [];
			let removals = [];
			let incomingCounter = 0;
			let outgoingCounter = 0;

			for (let i = 0; i < symbol.connectors.length; i++) {
				const connectorId = nodeId + 'connector' + i;
				if (incomingCounter < node.incoming.length) {
					const oldEdge = node.incoming[i];
					additions.push(new RdfTriple(oldEdge.rdfSubject, oldEdge.rdfPredicate, connectorId));
					removals.push(oldEdge);
					incomingCounter++;
				}

				if (outgoingCounter < node.outgoing.length) {
					const oldEdge = node.outgoing[i];
					additions.push(new RdfTriple(connectorId, oldEdge.rdfPredicate, oldEdge.rdfObject));
					removals.push(oldEdge);
					outgoingCounter++;
				}

				additions.push(new RdfTriple(nodeId, 'http://rdf.equinor.com/ui/hasConnector', connectorId));
				additions.push(new RdfTriple(connectorId, 'http://rdf.equinor.com/ui/hasConnectorSuffix', symbol.connectors[i].id));
			}
			const newPatch = new RdfPatch({
				tripleAdditions: [...additions, new RdfTriple(selection.individuals[0].iri, 'http://rdf.equinor.com/ui/hasSvg', svgs[0].toString())],
				tripleRemovals: removals,
			});
			let newPatches = [...patches, newPatch];
			setPatches(newPatches);
		}
	};

	const changeColor = () => {
		if (selection.individuals.length > 0) {
			const color = selection.individuals[0].data.color;
			const index = colors.indexOf(color ?? 'grey');
			const newIndex = (index + 1) % colors.length;
			addTriples([new RdfTriple(selection.individuals[0].iri, 'http://rdf.equinor.com/ui/color', colors[newIndex])]);
		}
	};

	const addNode = () => {
		addTriples([new RdfTriple('http://example.com/node' + nodeNumber, 'http://rdf.equinor.com/ui/color', colors[0])]);
		setNodeNumber(nodeNumber + 1);
	};

	const connect = () => {
		if (selection.individuals.length === 2) {
			const n1 = selection.individuals[0].iri;
			const n2 = selection.individuals[1].iri;

			addTriples([new RdfTriple(n1, 'http://example.com/connected', n2)]);
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
			<Button onClick={deleteSelection}> Delete </Button>
			<Button onClick={rotateSelection}> Rotate </Button>
			<Button onClick={switchSvg}> Switch svg </Button>
			<Button onClick={connect}> Connect </Button>
			<Button onClick={addNode}> Add </Button>
			<Button onClick={changeColor}> Color </Button>

			<SparqlGraph turtleString={turtleString} layoutName={layoutName} patches={patches} onElementsSelected={onElementsSelected} />
		</div>
	);
};
