import { Button, Chip, Divider, Typography } from '@equinor/eds-core-react';

import { DataFactory } from 'n3';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

import { useEffect, useState } from 'react';
import { useGraphContext } from '../../context/GraphContext';

import css from './TabEdit.module.css';
import {
	GraphEdge,
	GraphNode,
	RdfPatch,
	GraphPropertyPatch,
	GraphElement,
	GraphPatch,
	DirectProp,
} from '@rdf-graph/types/core';
import { directPropConfig as P } from '@rdf-graph/propConfig';
import { EdgeItemDetails } from './EdgeItemDetails';
import { NodeItemDetails } from './NodeItemDetails';

import { bfs } from '@rdf-graph/graphAlgorithms';

const { quad: q, literal: l, namedNode: n } = DataFactory;

function generateNodeName() {
	return uniqueNamesGenerator({
		dictionaries: [adjectives, animals],
		length: 2,
	});
}

export const TabEdit = () => {
	const { graphContext, dispatch } = useGraphContext();
	const [canAddEdge, setCanAddEdge] = useState(false);
	const [edgeNodes, setEdgeNodes] = useState<string[]>([]);
	const [selectedItem, setSelectedItem] = useState<GraphNode | GraphEdge>();
	const [latestCustomPatch, setLatestCustomPatch] = useState<GraphPatch[]>();

	const addNewNode = (_id?: string) => {
		const name = generateNodeName();
		const name_pretty = name
			.split('_')
			.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
			.join(' ');

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
	const highlightElement = (element: GraphElement): GraphPatch[] => {
		const patch: GraphPropertyPatch = {
			id: element.id,
			prop: { type: 'direct', key: 'fill', value: 'pink' },
			type: 'property',
		};
		return [{ action: 'add', content: patch }];
	};

	const createSummary = (element: GraphElement, visited: string[]): GraphPatch[] => {
		if (element.type === 'node') {
			const oldProp = element.props.find((p) => p.type === 'direct' && p.key === 'label');
			const oldLabel = oldProp ? (oldProp as DirectProp).value[0] : '';
			const patches: GraphPatch[] = [];
			if (oldLabel) {
				patches.push({
					action: 'remove',
					content: {
						id: element.id,
						prop: { type: 'direct', key: 'label', value: oldLabel },
						type: 'property',
					},
				});
			}

			const reachable = visited.length - 1;
			const plural = reachable === 1 ? '' : 's';
			const newLabel = `${oldLabel} (${reachable} node${plural} reachable from this node`;

			patches.push({
				action: 'add',
				content: {
					id: element.id,
					prop: { type: 'direct', key: 'label', value: newLabel },
					type: 'property',
				},
			});
			return patches;
		}
		return [];
	};

	const runBfs = (_id?: string) => {
		if (selectedItem && selectedItem.type === 'node') {
			const patches = bfs(
				{ nodes: [selectedItem.id], edges: [] },
				graphContext.graphState,
				highlightElement,
				(iris: string[]) => createSummary(selectedItem, iris)
			);
			setLatestCustomPatch(patches);
			dispatch({
				type: 'DispatchCustomGraphPatches',
				graphPatches: patches,
			});
		}
	};

	const addCluster = () => {
		const nodes = [0, 1, 2]
			.map((_i) => generateNodeName())
			.map((n) => {
				return {
					id: n,
					label: n
						.split('_')
						.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
						.join(' '),
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

	useEffect(() => {
		if (latestCustomPatch) {
			dispatch({
				type: 'DispatchCustomGraphPatches',
				graphPatches: latestCustomPatch.map((p) => {
					const revertedPatch: GraphPatch = {
						action: p.action === 'add' ? 'remove' : 'add',
						content: p.content,
					};
					return revertedPatch;
				}),
			});
			setLatestCustomPatch(undefined);
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
