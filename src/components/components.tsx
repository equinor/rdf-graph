import { FC, useEffect, useRef, useState } from 'react';
import { GraphNode, GraphEdge, GraphSelection, PropertyAssertion } from '../models/graphModel';
import { patchGraph } from '../state/patchGraph';
import { GraphProps, GraphStateProps } from '../state/GraphStateProps';
import { RdfContext } from '../state/RdfContext';
import { RdfStateProps } from '../state/RdfState.types';
import { F3DGraph } from './f3dGraph/F3DGraph';
import { CyGraph } from './cyGraph/CyGraph';
import { GoGraph } from './goGraph/GoGraph';

function createRdfGraphHoc<P extends GraphProps, R = Omit<P, keyof GraphProps>>(Component: FC<P>): FC<R & RdfStateProps> {
	return ({ rdfStore, rdfPatch, selectionEffect, ...props }: RdfStateProps) => {
		const prevSelectionEffect = useRef<PropertyAssertion[]>([]);
		const forwardSelection = (selection: GraphSelection) => {
			if (!selectionEffect) return [];
			const undo: PropertyAssertion[] = prevSelectionEffect.current.map(({ assertion, action }) => ({
				assertion,
				action: action === 'add' ? 'remove' : 'add',
			}));
			const effect = selectionEffect(selection);
			prevSelectionEffect.current = effect;
			return undo.concat(effect);
		};

		const [state, update] = useState<GraphStateProps>({
			graphState: {
				nodeIndex: new Map<string, GraphNode>(),
				linkIndex: new Map<string, GraphEdge>(),
			},
			graphPatch: [],
		});

		useEffect(() => {
			const newGraphState = patchGraph(state.graphState, rdfPatch);
			update(newGraphState);
		}, [rdfPatch]);

		return <Component {...({ ...state, ...props, selectionEffect: forwardSelection } as P)} />;
	};
}

function createRdfViewHoc<P extends RdfStateProps, R = Omit<P, keyof RdfStateProps>>(Component: FC<P>) {
	return (props: R) => <RdfContext.Consumer>{(value) => <Component {...(value as P)} {...(props as R)} />}</RdfContext.Consumer>;
}

export const Rdf3dGraph = createRdfGraphHoc(F3DGraph);
export const Rdf3dGraphView = createRdfViewHoc(Rdf3dGraph);
export const RdfCyGraph = createRdfGraphHoc(CyGraph);
export const RdfGoGraph = createRdfGraphHoc(GoGraph);
