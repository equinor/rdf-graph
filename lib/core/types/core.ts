import { Quad } from 'n3';
import { Point, UiSymbol } from './UiSymbol';

// PROPS

export type PropType = 'direct' | 'derived' | 'custom';

type BaseProp<TType extends PropType, TValue> = {
	type: TType;
	key: string;
	value: TValue;
};

export type DirectProp = BaseProp<'direct', string[]> & {
	key:
		| 'label'
		| 'description'
		| 'fill'
		| 'stroke'
		| 'rotation'
		| 'symbolId'
		| 'connectorIds'
		| 'connectorName'
		| 'group';
};

export type CustomProp = BaseProp<'custom', string[]> & {};

export type DerivedProp =
	| (BaseProp<'derived', UiSymbol> & { key: 'symbol' })
	| (BaseProp<'derived', number> & { key: 'connectorDirection' })
	| (BaseProp<'derived', Point> & {
			key: 'connectorRelativePosition';
	  });

export type KnownProp = DirectProp | DerivedProp;

export type Prop = KnownProp | CustomProp;

export type DirectPropKey = DirectProp['key'];

export type DerivedPropKey = DerivedProp['key'];

export type KnownPropKey = DirectPropKey | DerivedPropKey;

// STATE

export type ElementType = 'node' | 'edge';

type GraphElementBase<TElement extends ElementType> = {
	id: string;
	type: TElement;
};

export type NodeVariant = 'default' | 'connector' | 'symbol' | 'group';

export type NodeVariantInternal = NodeVariant | 'predicate';

type GraphNodeBase<TNodeVariant extends NodeVariantInternal> = GraphElementBase<'node'> & {
	variant: TNodeVariant;
	props: Prop[];
};

export type DefaultNode = GraphNodeBase<'default'> & {};

export type SymbolNode = GraphNodeBase<'symbol'> & {};

export type GroupNode = GraphNodeBase<'group'> & {};

export type ConnectorNode = GraphNodeBase<'connector'> & {
	symbolNodeRef: GraphNode;
};
export type PredicateNode = GraphNodeBase<'predicate'> & {
	/** NOTE: the 'id' is the predicate */
	edgeIds: string[];
};

export type GraphEdge = GraphElementBase<'edge'> & {
	predicateIri: string;
	sourceId: string;
	targetId: string;
};

export type GraphNode = DefaultNode | SymbolNode | ConnectorNode | GroupNode;

export type GraphNodeInternal = GraphNode | PredicateNode;

export type GraphElement = GraphNode | GraphEdge;

export type GraphElementInternal = GraphElement | PredicateNode;

export type GraphState = {
	predicateNodeStore: Record<string, PredicateNode>;
	nodeStore: Record<string, GraphNode>;
	edgeStore: Record<string, GraphEdge>;
};

// RDF & GRAPH PATCH (EXTERNAL API)

export type PatchDirectProp = Omit<DirectProp, 'value'> & { value: string };
export type PatchCustomProp = Omit<CustomProp, 'value'> & { value: string };

export type GraphPatchType = ElementType | 'property';

type GraphPatchBase<TType extends GraphPatchType> = {
	id: string;
	type: TType;
};

export type GraphNodePatch = GraphPatchBase<'node'> & {
	variant: NodeVariant;
	symbolNodeId?: string;
};

export type GraphEdgePatch = GraphPatchBase<'edge'> & {
	predicateIri: string;
	sourceId: string;
	targetId: string;
};

export type PatchProp = PatchDirectProp | DerivedProp | PatchCustomProp;

export type GraphPropertyPatch = GraphPatchBase<'property'> & {
	prop: PatchProp;
};

export interface GraphPatch {
	action: 'add' | 'remove';
	content: GraphNodePatch | GraphEdgePatch | GraphPropertyPatch;
}

export type RdfPatch = {
	action: 'add' | 'remove';
	data: Quad;
};

export type PatchGraphResult = {
	graphState: GraphState;
	graphPatches: GraphPatch[];
};
