import { FC, useEffect, useState } from 'react';
import { GraphNode, GraphEdge } from '../models/graphModel';
import { patchGraph } from './state/patchGraph';
import { GraphStateProps } from './state/GraphStateProps';
import { RdfContext } from './state/RdfContext';
import { RdfStateProps } from './state/RdfState.types';
import { F3DGraph } from './f3dGraph/F3DGraph';

function createRdfGraphHoc<P extends GraphStateProps, R = Omit<P, keyof GraphStateProps>>(Component: FC<P>): FC<R & RdfStateProps> {
	return ({ rdfStore, rdfPatch, ...props }: RdfStateProps) => {
		const [state, update] = useState<GraphStateProps>({
			graphState: {
				nodeIndex: new Map<string, GraphNode>(),
				linkIndex: new Map<string, GraphEdge>(),
			},
			graphPatch: [],
		});
		useEffect(() => {
			const newGraphState = patchGraph(state.graphState, rdfPatch);
			console.log(newGraphState.graphPatch);
			update(newGraphState);
		}, [rdfPatch]);

		return <Component {...({ ...state, ...props } as P)} />;
	};
}
function createRdfViewHoc<P extends RdfStateProps, R = Omit<P, keyof RdfStateProps>>(Component: FC<P>) {
	return (props: R) => <RdfContext.Consumer>{(value) => <Component {...(value as P)} {...(props as R)} />}</RdfContext.Consumer>;
}

export const Rdf3dGraph = createRdfGraphHoc(F3DGraph);
export const Rdf3dGraphView = createRdfViewHoc(Rdf3dGraph);
