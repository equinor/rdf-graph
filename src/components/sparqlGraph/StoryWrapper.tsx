import { Button } from '@equinor/eds-core-react';
import { Quad, DataFactory } from 'n3';
import { useState } from 'react';
import {
	colorPredicate,
	getPredicate,
	hasConnectorPredicate,
	hasConnectorSuffixPredicate,
	hasSvgPredicate,
	rotationPredicate,
} from '../../mapper/predicates';
import { RdfPatch, GraphSelection } from '../../models';
import { getData } from '../../models/cytoscapeElement';
import { RdfNodeDataDefinition } from '../../models/cytoscapeExtensions.types';
import { getSymbol, SymbolKey } from '../../symbol-api';
import { SparqlGraph } from './SparqlGraph';
import { LayoutProps } from './SparqlGraph.types';

const { namedNode, literal, quad } = DataFactory;

export type SparqlWrapperProps = {
	turtleString: string;
	layoutName: LayoutProps;
};

const colors = ['blue', 'green', 'red', 'yellow', 'purple', 'pink', 'cyan', 'grey'];
const svgs = [SymbolKey.Separator_1, SymbolKey.Valve_3Way_1];

export const StoryWrapper = ({ turtleString, layoutName }: SparqlWrapperProps) => {
	const [selection, setSelection] = useState<GraphSelection>(new GraphSelection([], []));

	const [patches, setPatches] = useState<Array<RdfPatch>>([]);

	const [nodeNumber, setNodeNumber] = useState<number>(1);

	const deleteSelection = () => {
		const edges = selection.edges
			.concat(selection.individuals.flatMap((i) => i.incoming))
			.concat(selection.individuals.flatMap((i) => i.outgoing));

		const dataTriples = selection.individuals.flatMap((i) => {
			let quads: Quad[] = [];
			const keys = Object.keys(i.data);
			keys.forEach((k) => {
				const predicate = getPredicate(k);
				predicate && quads.push(quad(namedNode(i.iri), predicate, literal(i.data[k])));
			});
			return quads;
		});

		const newPatch = new RdfPatch({ tripleAdditions: [], tripleRemovals: edges.concat(dataTriples) });

		let newPatches = [...patches, newPatch];
		setPatches(newPatches);
	};

	const rotateSelection = () => {
		if (selection.individuals.length > 0) {
			const current = selection.individuals[0];
			const currentIri = namedNode(current.id!);
			const currentRotation = parseInt(getData(current, rotationPredicate.value) ?? '0');
			const newRotation = ((currentRotation / 90 + 1) % 4) * 90;

			const newPatch = new RdfPatch({
				tripleAdditions: [quad(currentIri, rotationPredicate, literal(newRotation.toString()))],
				tripleRemovals: [quad(currentIri, rotationPredicate, literal(currentRotation.toString()))],
			});
			let newPatches = [...patches, newPatch];
			setPatches(newPatches);
		}
	};

	const switchSvg = () => {
		if (selection.individuals.length > 0) {
			const current = selection.individuals[0];
			const symbolId = getData(current, hasSvgPredicate.value);
			const currentIri = namedNode(current.id!);
			if (!symbolId) {
				convertToSvg();
			} else {
				const index = svgs.indexOf(symbolId as SymbolKey);
				const newIndex = (index + 1) % svgs.length;
				addTriples([quad(currentIri, hasSvgPredicate, literal(svgs[newIndex].toString()))]);
			}
		}
	};

	const convertToSvg = () => {
		const current = selection.individuals[0];
		const node = current;
		const nodeId = current.id!;
		const n3Node = namedNode(nodeId);

		const symbolId = svgs[0];
		const symbol = getSymbol(symbolId);
		console.log('SYMBOL ', symbol);

		let additions = [quad(n3Node, hasSvgPredicate, literal(symbolId))];
		let removals: Quad[] = [];
		let incomingCounter = 0;
		let outgoingCounter = 0;

		for (let i = 0; i < symbol.connectors.length; i++) {
			const n3Connector = namedNode(nodeId + 'connector' + i);
			const connectorSuffix = literal(symbol.connectors[i].id);

			if (incomingCounter < node.rdfIncoming.length) {
				const pair = node.rdfIncoming[incomingCounter];
				additions.push(quad(namedNode(pair.value), namedNode(pair.key), n3Connector));
				removals.push(quad(namedNode(pair.value), namedNode(pair.key), namedNode(nodeId)));
				incomingCounter++;
			} else if (outgoingCounter < node.rdfOutgoing.length) {
				const pair = node.rdfOutgoing[outgoingCounter];
				additions.push(quad(n3Connector, namedNode(pair.key), namedNode(pair.value)));
				removals.push(quad(namedNode(nodeId), namedNode(pair.key), namedNode(pair.value)));
				outgoingCounter++;
			}

			additions.push(quad(n3Node, hasConnectorPredicate, n3Connector));
			additions.push(quad(n3Connector, hasConnectorSuffixPredicate, connectorSuffix));
		}
		const newPatch = new RdfPatch({
			tripleAdditions: additions,
			tripleRemovals: removals,
		});

		console.log('PATCH', newPatch);
		let newPatches = [...patches, newPatch];
		setPatches(newPatches);
	};

	const changeColor = () => {
		if (selection.individuals.length > 0) {
			const color = selection.individuals[0].data.color;
			const index = colors.indexOf(color ?? 'grey');
			const newColorIndex = (index + 1) % colors.length;
			const colorLiteral = literal(colors[newColorIndex]);
			const node = namedNode(selection.individuals[0].iri);
			addTriples([quad(node, colorPredicate, colorLiteral)]);
		}
	};

	const addNode = () => {
		const node = namedNode('http://example.com/node' + nodeNumber);
		const colorLiteral = literal(colors[0]);
		addTriples([quad(node, colorPredicate, colorLiteral)]);

		setNodeNumber(nodeNumber + 1);
	};

	const connect = () => {
		if (selection.individuals.length === 2) {
			const node1 = namedNode(selection.individuals[0].id!);
			const node2 = namedNode(selection.individuals[1].id!);

			const exampleConnectedPredicate = namedNode('http://example.com/connected');

			addTriples([quad(node1, exampleConnectedPredicate, node2)]);
		}
	};

	const addTriples = (triples: Quad[]): void => {
		const newPatch = new RdfPatch({
			tripleAdditions: triples,
			tripleRemovals: [],
		});
		let newPatches = [...patches, newPatch];
		setPatches(newPatches);
	};

	const onElementsSelected = (selection: GraphSelection): void => {
		console.log('SELECTION ', selection);
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
