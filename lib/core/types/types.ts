import { Quad } from 'n3';

export type Point = { x: number; y: number };

export interface Symbol {
	id: string;
	width: number;
	height: number;
	angle?: number;
	svg?: string;
	/** Symbol as single svg <path> element value */
	geometry?: string;
	connectors: SymbolConnector[];
}

export interface SymbolConnector {
	id: string;
	width: number;
	height: number;
	direction: number;
	position: Point | 'Left' | 'Right' | 'Top' | 'Bottom';
}

export type SymbolProvider = (id: string, rotation?: number) => Symbol | undefined;

export type ElementType = 'node' | 'edge';

export type GraphElementBase<TNode extends ElementType> = {
	id: string;
	type: TNode;
};

export type NodeVariant = 'default' | 'connector' | 'symbol' | 'group';

export type NodeVariantInternal = NodeVariant | 'predicate';

export type KnownProps = Partial<{
	// Basic visualization props
	label: string;
	description: string;
	fill: string;
	stroke: string;
	rotation: number;

	// Props intended for symbol nodes
	connectors: string[];
	symbolId: string;
	symbol: Symbol;

	// Props intended for connectors
	connectorName: string;
	connectorDirection: number;
	connectorRelativePosition: Point;

	// Ref to the group it is part of
	group: GraphNode;
}>;

export type GraphNodeBase<TNodeVariant extends NodeVariantInternal> = GraphElementBase<'node'> & {
	//iri of subject or object
	variant: TNodeVariant;
	data: Record<string, string>;
	props: KnownProps;
};

export type DefaultNode = GraphNodeBase<'default'> & {};

export type SymbolNode = GraphNodeBase<'symbol'> & {};

export type GroupNode = GraphNodeBase<'group'> & {};

export type ConnectorNode = GraphNodeBase<'connector'> & {
	symbolNodeRef: SymbolNode;
};

export type PredicateNode = GraphNodeBase<'predicate'> & {
	/** NOTE: the 'id' the predicate */
	edgeIds: string[];
	props: {};
};

export type GraphEdge = GraphElementBase<'edge'> & {
	predicateIri: string;
	sourceId: string;
	targetId: string;
};

export type GraphNode = DefaultNode | SymbolNode | ConnectorNode | GroupNode;

export type GraphElement = GraphNode | GraphEdge;

export type GraphElementInternal = GraphNode | PredicateNode | GraphEdge;

// Include a type parameter to limit allowed values for the key parameter
export type GraphProperty<TTarget extends GraphNode> = {
	type: 'property';
	target: TTarget;
	key: keyof TTarget['props'];
	value: unknown;
};

export type GraphEdgeProperty = {
	type: 'edgeProperty';
	target: string;
	key: KnownPropKey;
	value: unknown;
}

// GraphData property can hold any key - value pairs
export type GraphDataProperty = {
	type: 'data';
	target: GraphElement;
	key: string;
	values: string[];
};

export interface GraphPatch {
	action: 'add' | 'remove';
	element: GraphNode | GraphEdge | GraphProperty<GraphNode> | GraphEdgeProperty | GraphDataProperty;
}

export type GraphState = {
	predicateNodeStore: Record<string, PredicateNode>;
	nodeStore: Record<string, GraphNode>;
	edgeStore: Record<string, GraphEdge>;
};

export type RdfPatch = {
	action: 'add' | 'remove';
	data: Quad;
};

export type KnownPropKey = keyof KnownProps;

type KnownPropConfig = {
	iri: string;
	invalidates: KnownPropKey[][];
	rule: (deps: KnownPropKey[]) => void;
};

export type PatchGraphResult = {
	graphState: GraphState;
	graphPatches: GraphPatch[];
};

export const PROPS: Record<KnownPropKey, KnownPropConfig> = {
	symbolId: {
		iri: 'http://rdf.equinor.com/ui/hasEngineeringSymbol',
		invalidates: [['symbol']],
		rule: () => {},
	},
	symbol: {
		iri: 'null',
		invalidates: [
			['connectors', 'connectorDirection'],
			['connectors', 'connectorRelativePosition'],
		],
		rule: () => {},
	},
	connectors: {
		iri: 'http://rdf.equinor.com/ui/hasConnector',
		invalidates: [['symbol']],
		rule: () => {},
	},
	connectorName: {
		iri: 'http://rdf.equinor.com/ui/hasConnectorName',
		invalidates: [['symbol']],
		rule: () => {},
	},
	connectorDirection: {
		iri: 'http://rdf.equinor.com/ui/hasConnectorDirection',
		invalidates: [['symbol']],
		rule: () => {},
	},
	connectorRelativePosition: {
		iri: 'http://rdf.equinor.com/ui/hasConnectorRelPosition',
		invalidates: [['symbol']],
		rule: () => {},
	},
	rotation: {
		iri: 'http://rdf.equinor.com/ui/hasRotation',
		invalidates: [['symbol']],
		rule: () => {},
	},
	fill: {
		iri: 'http://rdf.equinor.com/ui/fill',
		invalidates: [],
		rule: () => {},
	},
	stroke: {
		iri: 'http://rdf.equinor.com/ui/stroke',
		invalidates: [],
		rule: () => {},
	},
	label: {
		iri: 'http://www.w3.org/2000/01/rdf-schema#label',
		invalidates: [],
		rule: () => {},
	},
	description: {
		iri: 'http://rdf.equinor.com/ui/description',
		invalidates: [],
		rule: () => {},
	},
	group: {
		iri: 'http://rdf.equinor.com/ui/partOfGroup',
		invalidates: [],
		rule: () => {},
	},
};

export const knownPropKeys = Object.keys(PROPS) as KnownPropKey[];
