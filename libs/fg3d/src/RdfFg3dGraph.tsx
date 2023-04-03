import { useEffect, useRef, useState } from 'react';

import { GraphPatch, KnownPropKey, PatchProp, RdfGraphProps } from '@equinor/rdf-graph';

import ForceGraph3D, { ForceGraph3DInstance } from '3d-force-graph';
import { CustomGraphStore } from './custom.types';

export type RdfFg3dGraphProps = RdfGraphProps<Event> & {
	onF3dInit?: (f3d: ForceGraph3DInstance) => void;
};

export const RdfFg3dGraph = ({ graphPatches, onGraphSelectionChanged }: RdfFg3dGraphProps) => {
	const divRef = useRef<HTMLDivElement>(null);
	const f3dGraphInstance = useRef<ForceGraph3DInstance>();
	const [_initialized, setInitialized] = useState(false);

	const [fg3Model, setFg3Model] = useState<CustomGraphStore>({
		nodes: [],
		links: [],
	});

	useEffect(() => {
		const f3dGraph = ForceGraph3D();

		f3dGraph.width(window.innerWidth - 700);
		f3dGraph.height(window.innerHeight - 60);

		const element = divRef.current;

		if (element) {
			const instance = f3dGraph(element);
			if (onGraphSelectionChanged) {
				instance.onNodeClick((n, _e) =>
					onGraphSelectionChanged({ nodes: [(n as { id: string }).id], edges: [] })
				);
			}
			f3dGraphInstance.current = instance;
		} else {
			console.error('Fatal error during f3dgraph startup');
		}
		setInitialized(true);
	}, []);

	useEffect(() => {
		applyPatches(graphPatches);
	}, [graphPatches]);

	useEffect(() => {
		if (!f3dGraphInstance.current) return;

		if (fg3Model) {
			// force graph 3d will ruin our model if we pass it
			const copy = JSON.parse(JSON.stringify(fg3Model));
			f3dGraphInstance.current.graphData(copy);
		}
	}, [fg3Model]);

	const applyPatches = (patches: GraphPatch[]) => {
		if (!f3dGraphInstance.current) return;
		for (const patch of patches) {
			if (patch.action === 'remove') continue;
			const content = patch.content;
			switch (content.type) {
				case 'node':
					setFg3Model((store) => {
						return { ...store, nodes: [...store.nodes, { id: content.id }] };
					});
					break;
				case 'edge':
					setFg3Model((store) => {
						return {
							...store,
							links: [
								...store.links,
								{ id: content.id, source: content.sourceId, target: content.targetId },
							],
						};
					});
					break;
				case 'property':
					setFg3Model((store) => {
						return { ...store, nodes: addProp(content.id, content.prop, store.nodes) };
					});
					setFg3Model((store) => {
						return { ...store, links: addProp(content.id, content.prop, store.links) };
					});
					break;
			}
		}
	};

	const propMap = (key: KnownPropKey) => {
		switch (key) {
			case 'fill':
				return 'color';
			case 'stroke':
				return 'color';
			case 'label':
				return 'name';
		}
		return key;
	};

	function addProp<T extends { id: string }>(id: string, prop: PatchProp, store: T[]): T[] {
		const index = store.findIndex((n) => n.id === id);
		if (index === -1) {
			return store;
		}
		const oldElement = store[index];

		const fg3Key = prop.type === 'custom' ? prop.key : propMap(prop.key);

		const newElement = {
			...oldElement,
			[fg3Key]: prop.value,
		};

		const newStore = [...store.slice(0, index), newElement, ...store.slice(index + 1)];

		return newStore;
	}

	return <div ref={divRef}></div>;
};
