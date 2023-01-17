import { useEffect, useRef, useState } from 'react';

import { GraphPatch, GraphState } from '../core/types/core';
import { RdfGraphProps } from '../core/types/ui';
import { patchGraphState } from '../core/patch';

import ForceGraph3D, {ForceGraph3DInstance } from '3d-force-graph';

export type RdfF3dGraphProps = RdfGraphProps<Event> & {
	onF3dInit?: (f3d: ForceGraph3DInstance) => void;
};

export const RdfF3dGraph = ({
	style,
	customGraphPatches,
	rdfPatches,
	symbolProvider,
	onGraphStateChanged,
}: RdfF3dGraphProps) => {

	const defaultDiagramStyle: React.CSSProperties = {
		height: '100vh',
		width: '100%',
		overflow: 'hidden',
	};

	const divRef = useRef<HTMLDivElement>(null);
	const f3dGraphInstance = useRef<ForceGraph3DInstance>();

	const [graphState, setGraphState] = useState<GraphState>({
		nodeStore: {},
		predicateNodeStore: {},
		edgeStore: {},
	});

	useEffect(() => {
		const f3dGraph = ForceGraph3D();
		const element = divRef.current
		if (element) {
			f3dGraphInstance.current = f3dGraph(element);
		} else {
			console.error("Fatal error during f3dgraph startup");
		}
		
	}, []);

	useEffect(() => {
		const patchGraphResult = patchGraphState(graphState, rdfPatches, { symbolProvider });
		setGraphState(patchGraphResult.graphState);

		if (onGraphStateChanged) {
			onGraphStateChanged({ ...patchGraphResult.graphState });
		}
		applyPatches(patchGraphResult.graphPatches);
	}, [rdfPatches]);

	useEffect(() => {
		applyPatches(customGraphPatches);
	}, [customGraphPatches]);

	useEffect(() => {
		if (!f3dGraphInstance.current) return;

		const nodes = Object.keys(graphState.nodeStore).map(k => {return {id: k}});
		const links = Object.keys(graphState.edgeStore).map(k => {return {id: k, source: graphState.edgeStore[k].sourceId, target: graphState.edgeStore[k].targetId}});

		f3dGraphInstance.current.graphData({
			nodes: nodes,
			links: links
		});
	}, [graphState])

	const applyPatches = (_patches: GraphPatch[]) => {
		if (!f3dGraphInstance.current) return;
	};


	return <div ref={divRef}  style={style ?? defaultDiagramStyle}></div>;
};
