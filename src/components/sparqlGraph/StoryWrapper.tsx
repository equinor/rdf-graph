import { Button } from '@equinor/eds-core-react';
import { Quad, DataFactory } from 'n3';
import { useState } from 'react';
import { colorPredicate, hasConnectorPredicate, hasConnectorSuffix, hasSvgPredicate, rotationPredicate } from '../../mapper/predicates';
import { RdfPatch, GraphSelection, Edge } from '../../models';
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
		const newPatch = new RdfPatch({ edgeRemovals: selection.edges, individualRemovals: selection.individuals });
		let newPatches = [...patches, newPatch];
		setPatches(newPatches);
	};

	const rotateSelection = () => {
		if (selection.individuals.length > 0) {
			const currentIri = namedNode(selection.individuals[0].iri);
			const data = selection.individuals[0].data;
			const currentRotation = parseInt(data.rotation ?? '0');
			const newRotation = ((currentRotation / 90 + 1) % 4) * 90;

			addTriples([quad(currentIri, rotationPredicate, literal(newRotation.toString()))]);
		}
	};

	const switchSvg = () => {
		if (selection.individuals.length > 0) {
			const currentIri = namedNode(selection.individuals[0].iri);
			const symbolId = selection.individuals[0].data.symbolId;
			if (!symbolId) {
				convertToSvg();
			} else {
				const index = svgs.indexOf(symbolId);
				const newIndex = (index + 1) % svgs.length;
				addTriples([quad(currentIri, hasSvgPredicate, literal(svgs[newIndex].toString()))]);
			}
		}
	};

	const convertToSvg = () => {
		if (selection.individuals.length > 0) {
			const node = selection.individuals[0];
			const nodeId = selection.individuals[0].iri;
			const n3Node = namedNode(nodeId);

			const symbolId = svgs[0];
			const symbol = getSymbol(symbolId);

			let additions = [quad(n3Node, hasSvgPredicate, literal(symbolId))];
			let removals: Edge[] = [];
			let incomingCounter = 0;
			let outgoingCounter = 0;

			for (let i = 0; i < symbol.connectors.length; i++) {
				const n3Connector = namedNode(nodeId + 'connector' + i);
				const connectorSuffix = literal(symbol.connectors[i].id);

				if (incomingCounter < node.incoming.length) {
					const oldEdge = node.incoming[incomingCounter];
					const oldQuad = oldEdge.quad;
					additions.push(quad(oldQuad.subject, oldQuad.predicate, n3Connector));
					removals.push(oldEdge);
					incomingCounter++;
				} else if (outgoingCounter < node.outgoing.length) {
					const oldEdge = node.outgoing[outgoingCounter];
					const oldQuad = oldEdge.quad;
					additions.push(quad(n3Connector, oldQuad.predicate, oldQuad.object));
					removals.push(oldEdge);
					outgoingCounter++;
				}

				additions.push(quad(n3Node, hasConnectorPredicate, n3Connector));
				additions.push(quad(n3Connector, hasConnectorSuffix, connectorSuffix));
			}
			const newPatch = new RdfPatch({
				tripleAdditions: additions,
				edgeRemovals: removals,
			});
			let newPatches = [...patches, newPatch];
			setPatches(newPatches);
		}
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
			const node1 = namedNode(selection.individuals[0].iri);
			const node2 = namedNode(selection.individuals[1].iri);

			const exampleConnectedPredicate = namedNode('http://example.com/connected');

			addTriples([quad(node1, exampleConnectedPredicate, node2)]);
		}
	};

	const addTriples = (triples: Quad[]): void => {
		const newPatch = new RdfPatch({
			tripleAdditions: triples,
		});
		let newPatches = [...patches, newPatch];
		setPatches(newPatches);
	};

	const onElementsSelected = (selection: GraphSelection): void => {
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
