import { Button, Chip, Divider, Typography } from '@equinor/eds-core-react';

import { DataFactory } from 'n3';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

import { useEffect, useState } from 'react';
import { useGraphContext } from '../../context/GraphContext';

import css from './TabEdit.module.css';
import { GraphEdge, GraphNode, RdfPatch, GraphPatch } from '@rdf-graph/types/core';
import { directPropConfig as P } from '@rdf-graph/propConfig';
import { EdgeItemDetails } from './EdgeItemDetails';
import { NodeItemDetails } from './NodeItemDetails';

import {
	getConnectorSymbol,
	symbolLibrary,
	SymbolLibraryKey,
} from '../../../../lib/core/symbol-api';
import { UiSymbol } from '@rdf-graph/types/UiSymbol';
import { bfs } from '@rdf-graph/algorithms/graphAlgorithms';
import { highlightElement, createSummary } from '@rdf-graph/algorithms/algorithmEffects';

const { quad: q, literal: l, namedNode: n } = DataFactory;

function generateNodeName() {
	const name = uniqueNamesGenerator({
		dictionaries: [adjectives, animals],
		length: 2,
	});

	const name_pretty = name
		.split('_')
		.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
		.join(' ');

	return { name, name_pretty };
}

export const TabEdit = () => {
	const { graphContext, dispatch } = useGraphContext();
	const [canAddEdge, setCanAddEdge] = useState(false);
	const [edgeNodes, setEdgeNodes] = useState<string[]>([]);
	const [selectedItem, setSelectedItem] = useState<GraphNode | GraphEdge>();
	const [undoPatch, setUndoPatch] = useState<GraphPatch[]>();

	const addNewNode = (_id?: string) => {
		const { name, name_pretty } = generateNodeName();

		dispatch({
			type: 'DispatchRdfPatches',
			rdfPatches: [
				{
					action: 'add',
					data: q(n('http://example.com/animals/' + name), n(P.label.iri), l(name_pretty)),
				},
			],
		});
	};

	const runBfs = (_id?: string) => {
		if (selectedItem && selectedItem.type === 'node') {
			const result = bfs(
				{ nodes: [selectedItem.id], edges: [] },
				graphContext.graphState,
				highlightElement,
				(iris: string[]) => createSummary(selectedItem, iris)
			);

			dispatch({
				type: 'DispatchCustomGraphPatches',
				graphPatches: result.patches,
			});
			const revertedPatches = result.patches.map((p) => {
				const reverted: GraphPatch = {
					action: p.action === 'remove' ? 'add' : 'remove',
					content: p.content,
				};
				return reverted;
			});
			setUndoPatch([...revertedPatches, ...result.undoPatches]);
		}
	};

	const addCluster = () => {
		const nodes = [0, 1, 2].map(() => {
			const { name, name_pretty } = generateNodeName();
			return {
				id: name,
				label: name_pretty,
			};
		});

		dispatch({
			type: 'DispatchRdfPatches',
			rdfPatches: [
				...nodes.map<RdfPatch>((node) => {
					return {
						action: 'add',
						data: q(n('http://example.com/animals/' + node.id), n(P.label.iri), l(node.label)),
					};
				}),
				{
					action: 'add',
					data: q(
						n('http://example.com/animals/' + nodes[0].id),
						n('connectedTo'),
						n('http://example.com/animals/' + nodes[1].id)
					),
				},
				{
					action: 'add',
					data: q(
						n('http://example.com/animals/' + nodes[1].id),
						n('connectedTo'),
						n('http://example.com/animals/' + nodes[2].id)
					),
				},
				{
					action: 'add',
					data: q(
						n('http://example.com/animals/' + nodes[2].id),
						n('connectedTo'),
						n('http://example.com/animals/' + nodes[0].id)
					),
				},
				{
					action: 'add',
					data: q(n('connectedTo'), n(P.label.iri), l('Test!')),
				},
				{
					action: 'add',
					data: q(n('connectedTo'), n(P.stroke.iri), l('green')),
				},
			],
		});
	};

	const addEdge = () => {
		if (!canAddEdge) return;
		addEdgeFromIris(graphContext.graphSelection.nodes[0], graphContext.graphSelection.nodes[1]);
	};

	const addEdgeFromIris = (sourceIri: string, targetIri: string) => {
		dispatch({
			type: 'DispatchRdfPatches',
			rdfPatches: [
				{
					action: 'add',
					data: q(n(sourceIri), n('connectedTo'), n(targetIri)),
				},
			],
		});
	};

	const createSymbolWithConnectors: (symbolId: SymbolLibraryKey) => {
		patches: RdfPatch[];
		connectors: string[];
	} = (symbolId: SymbolLibraryKey) => {
		const { name, name_pretty } = generateNodeName();

		const symbolNodeIri = 'http://example.com/animals/' + name;

		const symbol: UiSymbol = getConnectorSymbol(symbolId);

		const symbolNodePatches: RdfPatch[] = [];

		const connectorIds: string[] = [];

		const connectorPatches: RdfPatch[] = symbol.connectors.flatMap((c) => {
			const connectorNodeIri = symbolNodeIri + '_C' + c.id;
			connectorIds.push(connectorNodeIri);
			return [
				{ action: 'add', data: q(n(connectorNodeIri), n(P.connectorName.iri), l(c.id)) },
				{ action: 'add', data: q(n(symbolNodeIri), n(P.connectorIds.iri), n(connectorNodeIri)) },
			];
		});

		symbolNodePatches.push(
			{
				action: 'add',
				data: q(n(symbolNodeIri), n(P.label.iri), l(name_pretty)),
			},
			{
				action: 'add',
				data: q(n(symbolNodeIri), n(P.fill.iri), l('yellow')),
			},
			{
				action: 'add',
				data: q(n(symbolNodeIri), n(P.symbolId.iri), l(symbol.id)),
			},
			...connectorPatches
		);

		return { patches: symbolNodePatches, connectors: connectorIds };
	};

	const addTwoConnectedSymbolNodes = () => {
		const sym1 = createSymbolWithConnectors('ND0012');
		const sym2 = createSymbolWithConnectors('ND0016');

		dispatch({
			type: 'DispatchRdfPatches',
			rdfPatches: [
				{
					action: 'add',
					data: q(n(sym1.connectors[1]), n('connectedTo'), n(sym2.connectors[0])),
				},
				...sym1.patches,
				...sym2.patches,
			],
		});
	};

	const addCompleteSymbolLibrary = () => {
		const patches = Object.keys(symbolLibrary)
			.map((x) => createSymbolWithConnectors(x as SymbolLibraryKey))
			.flatMap((x) => x.patches);
		dispatch({
			type: 'DispatchRdfPatches',
			rdfPatches: patches,
		});
	};

	useEffect(() => {
		if (undoPatch) {
			dispatch({
				type: 'DispatchCustomGraphPatches',
				graphPatches: undoPatch,
			});
			setUndoPatch(undefined);
		}
		const n = graphContext.graphSelection.nodes;
		const e = graphContext.graphSelection.edges;
		if (n.length === 1) {
			setEdgeNodes([n[0]]);
		} else if (n.length === 2) {
			const n1 = edgeNodes[0];
			const n2 = n1 === n[0] ? n[1] : n[0];
			setEdgeNodes([n1, n2]);
		} else {
			setEdgeNodes([]);
		}

		if (n.length >= 1 && e.length === 0) {
			const store = graphContext.graphState.nodeStore;
			if (n[0] in store) {
				setSelectedItem({ ...store[n[0]] });
			}
		} else if (n.length === 0 && e.length >= 1) {
			const store = graphContext.graphState.edgeStore;
			if (e[0] in store) {
				setSelectedItem({ ...store[e[0]] });
			}
		} else {
			setSelectedItem(undefined);
		}
	}, [graphContext.graphSelection]);

	useEffect(() => {
		setCanAddEdge(edgeNodes.length === 2);
	}, [edgeNodes]);

	return (
		<div className={css.wrapper}>
			<MenuSection title="Node">
				<Button onClick={() => addNewNode()}>Add Animal Node</Button>
				<Button onClick={() => addCluster()}>Add Cluster</Button>
				<Button onClick={() => addTwoConnectedSymbolNodes()}>Add Two Connected Symbol Nodes</Button>
				<Button onClick={() => addCompleteSymbolLibrary()}>Add all symbols</Button>
				<Button onClick={() => runBfs()}>Highlight connected nodes</Button>
			</MenuSection>
			<Divider variant="small" style={{ width: '100%' }} />
			<MenuSection title="Edge">
				{canAddEdge ? (
					<>
						<Typography variant="h6">{edgeNodes[0]}</Typography>
						<Typography variant="h6">connectedTo</Typography>
						<Typography variant="h6">{edgeNodes[1]}</Typography>
					</>
				) : (
					<Typography variant="h5" style={{ marginBottom: '10px' }}>
						Select exactly two nodes
					</Typography>
				)}
				<Button onClick={() => addEdge()} disabled={!canAddEdge}>
					Add Edge
				</Button>
			</MenuSection>
			<Divider variant="small" style={{ width: '100%' }} />
			<MenuSection
				title="Selection"
				chips={[
					`${graphContext.graphSelection.nodes.length} nodes`,
					`${graphContext.graphSelection.edges.length} edges`,
				]}>
				{selectedItem !== undefined ? (
					{
						node: <NodeItemDetails node={selectedItem as GraphNode} />,
						edge: <EdgeItemDetails edge={selectedItem as GraphEdge} />,
					}[selectedItem.type]
				) : (
					<Typography variant="h6">Select a single item</Typography>
				)}
			</MenuSection>
		</div>
	);
};

const MenuSection: React.FunctionComponent<
	React.PropsWithChildren<{ title: string; chips?: string[] }>
> = ({ title, chips, children }) => {
	return (
		<div className={css.section}>
			<div className={css.sectionTitle}>
				<Typography variant="h5" style={{ marginBottom: '10px' }}>
					{title}
				</Typography>
				{chips ? chips.map((c, i) => <Chip key={i}>{c}</Chip>) : null}
			</div>
			{children}
		</div>
	);
};
