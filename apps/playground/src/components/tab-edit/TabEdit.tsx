import { Autocomplete, Button, Chip, Divider, Typography } from '@equinor/eds-core-react';

import { DataFactory, Quad } from 'n3';
import { uniqueNamesGenerator, adjectives, animals, starWars } from 'unique-names-generator';

import { useEffect, useState } from 'react';
import { useGraphContext } from '../../context/GraphContext';

import css from './TabEdit.module.css';

import { EdgeItemDetails } from './EdgeItemDetails';
import { NodeItemDetails } from './NodeItemDetails';

import {
	devPrefixes,
	predicateIri as PREDICATES,
	prettyIri,
	prettyToFullIri,
} from '../../rdf/rdf-utils';

import {
	bfs,
	createSummary,
	GraphEdge,
	GraphNode,
	GraphPatch,
	highlightElement,
	RdfPatch,
	directPropConfig as P,
	UiSymbol,
} from '@equinor/rdf-graph';

import { kantoPokemons } from './pokemon';
import { AddOrRemoveProp } from './AddOrRemoveProp';
import { RdfIri } from '../rdf-iri/RdfIri';
import { fetchAllSymbols } from '../../symbol-api/api';
import { useQuery } from '@tanstack/react-query'

const { quad: q, literal: l, namedNode: n } = DataFactory;


function generateNodeName() {
	const dicts = [animals, starWars, kantoPokemons];
	const randDict = dicts[Math.floor(Math.random() * dicts.length)];
	let name = uniqueNamesGenerator({
		dictionaries: [adjectives, randDict],
		length: 2,
		separator: '_',
	});

	name = name.split(' ').join('_').toLowerCase();

	const name_pretty = name
		.split('_')
		.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
		.join(' ');

	return { name, name_pretty };
}

export const TabEdit = () => {
	const { graphContext, dispatch } = useGraphContext();
	const [edgeNodes, setEdgeNodes] = useState<string[]>([]);
	const [predicate, setPredicate] = useState<string>(PREDICATES.connectedTo);
	const [selectedItem, setSelectedItem] = useState<GraphNode | GraphEdge>();
	const [undoPatch, setUndoPatch] = useState<GraphPatch[]>();

	const { status, data: symbols, error, isFetching } = useQuery<UiSymbol[]>({
		queryKey:['symbols'],
		queryFn: fetchAllSymbols
	});

	const addNewNode = (_id?: string) => {
		const { name, name_pretty } = generateNodeName();

		dispatch({
			type: 'DispatchRdfPatches',
			rdfPatches: [
				{
					action: 'add',
					data: q(n(devPrefixes.animals + name), n(P.label.iri), l(name_pretty)),
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

		const nsp = devPrefixes.animals;
		const connectedToIri = PREDICATES.connectedTo;

		dispatch({
			type: 'DispatchRdfPatches',
			rdfPatches: [
				...nodes.map<RdfPatch>((node) => {
					return {
						action: 'add',
						data: q(n(nsp + node.id), n(P.label.iri), l(node.label)),
					};
				}),
				{
					action: 'add',
					data: q(n(nsp + nodes[0].id), n(connectedToIri), n(nsp + nodes[1].id)),
				},
				{
					action: 'add',
					data: q(n(nsp + nodes[1].id), n(connectedToIri), n(nsp + nodes[2].id)),
				},
				{
					action: 'add',
					data: q(n(nsp + nodes[2].id), n(connectedToIri), n(nsp + nodes[0].id)),
				},
				{
					action: 'add',
					data: q(n(connectedToIri), n(P.label.iri), l('Test!')),
				},
				{
					action: 'add',
					data: q(n(connectedToIri), n(P.stroke.iri), l('green')),
				},
			],
		});
	};

	const addEdge = () => {
		if (graphContext.graphSelection.nodes.length !== 2) return;
		const dummyEdge: Partial<GraphEdge> = {
			sourceId: edgeNodes[0],
			predicateIri: predicate,
			targetId: edgeNodes[1],
		};
		patchEdges([dummyEdge], 'add');
	};

	const removeEdges = () => {
		const edges = graphContext.graphSelection.edges.map(
			(edgeId) => graphContext.graphState.edgeStore[edgeId]
		);
		patchEdges(edges, 'remove');
	};

	const patchEdges = (edges: Partial<GraphEdge>[], action: 'add' | 'remove') => {
		const quads: Quad[] = [];
		for (const edge of edges) {
			const { sourceId, predicateIri, targetId } = edge;
			if (!sourceId || !predicateIri || !targetId) continue;
			quads.push(q(n(sourceId), n(predicateIri), n(targetId)));
		}
		dispatch({
			type: 'DispatchRdfPatches',
			rdfPatches: quads.map((data) => ({ action, data })),
		});
	};

	const createSymbolWithConnectors: (symbolId: string) => {
		patches: RdfPatch[];
		connectors: string[];
	} = (symbolId: string) => {
		const { name, name_pretty } = generateNodeName();

		const symbolNodeIri = devPrefixes.animals + name;


		const symbol = symbols?.find(s => s.id === symbolId);

		if (!symbol) throw new Error(`Symbol not found: ${symbolId}`);

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
		console.log("Button clicked");
		if (!symbols) {
			console.warn("No symbols");
			return;
		}
		const sym1 = createSymbolWithConnectors(symbols[0].id);
		const sym2 = createSymbolWithConnectors(symbols[1].id);

		dispatch({
			type: 'DispatchRdfPatches',
			rdfPatches: [
				{
					action: 'add',
					data: q(n(sym1.connectors[1]), n(PREDICATES.connectedTo), n(sym2.connectors[0])),
				},
				...sym1.patches,
				...sym2.patches,
			],
		});
	};

	const addCompleteSymbolLibrary = () => {
		if (!symbols) {
			console.warn("No symbols");
			return;
		}
		const patches = symbols.map(s => s.id)
			.map((x) => createSymbolWithConnectors(x))
			.flatMap((x) => x.patches);
		dispatch({
			type: 'DispatchRdfPatches',
			rdfPatches: patches,
		});
	};

	const createPredicateSuggestions = () =>
		[
			PREDICATES.connectedTo,
			P.group.iri,
			P.connectorIds.iri,
			...Object.keys(graphContext.graphState.predicateNodeStore),
			...Object.keys(graphContext.graphState.nodeStore),
		].map((iri) => prettyIri(iri));

	function convertToPizza() {
		if (!selectedItem || selectedItem.type !== 'node') return;

		const label = selectedItem.props.find((prop) => prop.key === 'label')?.value ?? '';

		dispatch({
			type: 'DispatchRdfPatches',
			rdfPatches: [
				{
					action: 'add',
					data: q(n(selectedItem.id), n(P.template.iri), l('pizza')),
				},
				{
					action: 'add',
					data: q(n(selectedItem.id), n('pizzaName'), l('Pepperoni with ' + label)),
				},
			],
		});
	}


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

	return (
		<div className={css.wrapper}>
			<MenuSection title="Node">
				<div className={css.buttons}>
					<Button onClick={() => addNewNode()}>Add Node</Button>
					<Button onClick={() => addCluster()}>Add Cluster</Button>
					<Button onClick={() => addTwoConnectedSymbolNodes()}>Add connected Symbols</Button>
					<Button onClick={() => addCompleteSymbolLibrary()}>Add all symbols</Button>
					<Button onClick={() => runBfs()} disabled={selectedItem?.type !== 'node'}>
						Highlight connected nodes
					</Button>
					<Button onClick={convertToPizza} disabled={selectedItem?.type !== 'node'}>
						Convert to Pizza
					</Button>
				</div>
			</MenuSection>
			<Divider variant="small" style={{ width: '100%' }} />
			<MenuSection title="Edge">
				{graphContext.graphSelection.nodes.length === 2 && (
					<>
						<RdfIri iri={edgeNodes[0]} variant="h6" />
						{/* <Typography variant="h6">{prettyIri(edgeNodes[0])}</Typography> */}
						{/* <Typography variant="h6">{predicate}</Typography> */}

						<Autocomplete
							className={css.addPropInput}
							label="Iri for predicate"
							options={createPredicateSuggestions()}
							initialSelectedOptions={[prettyIri(predicate)]}
							onOptionsChange={(c) => {
								if (c.selectedItems[0]) setPredicate(prettyToFullIri(c.selectedItems[0]));
							}}
						/>
						<RdfIri iri={edgeNodes[1]} variant="h6" />
						<Button onClick={() => addEdge()}>Add Edge</Button>
					</>
				)}
				{graphContext.graphSelection.edges.length > 0 && (
					<>
						<Button onClick={() => removeEdges()}>Remove Selected Edge(s)</Button>
					</>
				)}
				{graphContext.graphSelection.edges.length === 0 &&
					graphContext.graphSelection.nodes.length !== 2 && (
						<Typography variant="h6" style={{ marginBottom: '10px' }}>
							Select one or more edges to delete, or select exactly two nodes to add an edge
						</Typography>
					)}
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
			{selectedItem ? (
				<>
					<Divider variant="small" style={{ width: '100%' }} />
					<MenuSection
						title="Add or Remove Property (Triple)"
						chips={[`Target: ${prettyIri(selectedItem?.id) ?? '?'}`]}>
						<AddOrRemoveProp element={selectedItem} />
					</MenuSection>
				</>
			) : null}
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
