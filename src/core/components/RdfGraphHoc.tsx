import { FC, useEffect, useRef, useState } from 'react';
import { GraphNode, GraphEdge, GraphSelection, PropertyAssertion } from '../types/graphModel';
import { patchGraph } from '../state/patchGraph';
import { GraphProps, GraphStateProps } from '../state/GraphStateProps';
import { RdfContext } from '../state/RdfContext';
import { RdfStateProps } from '../state/RdfState.types';

export function createRdfGraphHoc<P extends GraphProps, R = Omit<P, keyof GraphProps>>(Component: FC<P>): FC<R & RdfStateProps> {
	return ({ rdfStore: _rdfStore, rdfPatch, selectionEffect, ...props }: RdfStateProps) => {
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
			const newGraphState = patchGraph(state.graphState, rdfPatch, { symbolProvider: props.symbolProvider });
			update(newGraphState);
		}, [rdfPatch]);

		return <Component {...({ ...state, ...props, selectionEffect: forwardSelection } as P)} />;
	};
}

export function createRdfViewHoc<P extends RdfStateProps, R = Omit<P, keyof RdfStateProps>>(Component: FC<P>) {
	return (props: R) => <RdfContext.Consumer>{(value) => <Component {...(value as P)} {...(props as R)} />}</RdfContext.Consumer>;
}
