import { useEffect, useRef } from 'react';
import ForceGraph3D, { ForceGraph3DInstance } from '3d-force-graph';

import { GraphPatch } from '../core/types/core';
import { RdfGraphProps } from '../core/types/ui';

export type RdfF3dGraphProps = RdfGraphProps<Event> & {
	onF3dInit?: (f3d: ForceGraph3DInstance) => void;
};

export const RdfF3dGraph = ({ graphPatches }: RdfF3dGraphProps) => {
	const divRef = useRef<HTMLDivElement>(null);
	const f3dGraphInstance = useRef<ForceGraph3DInstance>();

	useEffect(() => {
		const f3dGraph = ForceGraph3D();

		f3dGraph.width(window.innerWidth - 550);
		f3dGraph.height(window.innerHeight - 60);

		const element = divRef.current;

		if (element) {
			f3dGraphInstance.current = f3dGraph(element);
		} else {
			console.error('Fatal error during f3dgraph startup');
		}
	}, []);

	const applyPatches = (_patches: GraphPatch[]) => {
		if (!f3dGraphInstance.current) return;

		// TODO: Martin...
	};

	useEffect(() => {
		applyPatches(graphPatches);
	}, [graphPatches]);

	// useEffect(() => {
	// 	if (!f3dGraphInstance.current) return;

	// 	const nodes = Object.keys(graphState.nodeStore).map((k) => {
	// 		return { id: k };
	// 	});
	// 	const links = Object.keys(graphState.edgeStore).map((k) => {
	// 		return {
	// 			id: k,
	// 			source: graphState.edgeStore[k].sourceId,
	// 			target: graphState.edgeStore[k].targetId,
	// 		};
	// 	});

	// 	f3dGraphInstance.current.graphData({
	// 		nodes: nodes,
	// 		links: links,
	// 	});
	// }, [graphState]);

	return <div ref={divRef}></div>;
};
