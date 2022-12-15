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

type NodeVariant = 'default' | 'connector' | 'engsym' | 'group';

export type NodeVariantInternal = NodeVariant | 'predicate';

export type BasicProps = Partial<{
	label: string;
	description: string;
	fill: string;
	stroke: string;
}>;

type BaseNode<TVariant extends NodeVariantInternal> = GraphElementBase<'node'> & {
	variant: TVariant;
	data: Map<string, string>;
	props: BasicProps & {
		group?: GraphNode;
	};
};

export type DefaultNode = BaseNode<'default'>;

export type EngSymbolNode = BaseNode<'engsym'> & {
	props: {
		engsymConnectors: string[];
		engsymId: string;
		engsym: Symbol;
		rotation: number;
	};
};

export type ConnectorNode = BaseNode<'connector'> & {
	props: {
		/** The id of the connector (from predicate) */
		connectorName: string;
		connectorDirection: number;
		connectorRelativePosition: Point;
	};
};

export type PredicateNode = BaseNode<'predicate'> & {
	/** NOTE: the 'id' the predicate */
	edgeIds: string[];
	props: {};
};

export type GraphEdge = GraphElementBase<'edge'> & {
	sourceId: string;
	targetId: string;
};

export type GraphNode = DefaultNode | EngSymbolNode | ConnectorNode;

export type GraphElement = GraphNode | GraphEdge;

export type GraphElementInternal = GraphNode | PredicateNode | GraphEdge;

// Include a type parameter to limit allowed values for the key parameter
export type GraphProperty<TTarget extends GraphNode> = {
	type: 'property';
	target: TTarget;
	key: keyof TTarget['props'];
	value: unknown;
};

// GraphData property can hold any key - value pairs
export type GraphDataProperty = {
	type: 'data';
	target: GraphElement;
	key: string;
	values: string[];
};

export interface GraphPatch {
	action: 'add' | 'remove';
	element: GraphNode | GraphEdge | GraphProperty<GraphNode> | GraphDataProperty;
}

/*
element1 hasColor green . // add node, add prop green
node1 element1 node2
   add node1,
   add node2,
   delete prop green,
   delete node "element1",   
   add internal predicateNode element1,
   add edge from node1 to node2
   add interanle predicateNodeProp hasColor 'green'
   add prop hasColor 'green' for all edges having reference to predicateNode 'element1'
   
node2 element1 node3
element1 hasColor red .
*/

export type GraphState = {
	predicateNodeStore: Record<string, PredicateNode>;
	nodeStore: Record<string, GraphNode>;
	edgeStore: Record<string, GraphEdge>;
};

export type RdfPatch = {
	action: 'add' | 'remove';
	data: Quad;
};

export type KnownProp =
	| keyof BasicProps
	| keyof DefaultNode['props']
	| keyof ConnectorNode['props']
	| keyof EngSymbolNode['props'];

type KnownPropConfig = {
	iri: string | null;
	invalidates: KnownProp[][];
	//default: unknown[] | string | number;
	rule: (deps: KnownProp[]) => void;
};

export const PROPS: Record<KnownProp, KnownPropConfig> = {
	engsymId: {
		iri: 'http://rdf.equinor.com/ui/hasEngineeringSymbol',
		invalidates: [['engsym']],
		rule: () => {},
	},
	engsym: {
		iri: null,
		invalidates: [
			['engsymConnectors', 'connectorDirection'],
			['engsymConnectors', 'connectorRelativePosition'],
		],
		rule: () => {},
	},
	engsymConnectors: {
		iri: 'http://rdf.equinor.com/ui/hasConnector',
		invalidates: [['engsym']],
		rule: (d) => {},
	},
	connectorName: {
		iri: 'http://rdf.equinor.com/ui/hasConnectorName',
		invalidates: [['engsym']],
		rule: () => {},
	},
	connectorDirection: {
		iri: 'http://rdf.equinor.com/ui/hasConnectorDirection',
		invalidates: [['engsym']],
		rule: () => {},
	},
	connectorRelativePosition: {
		iri: 'http://rdf.equinor.com/ui/hasConnectorRelPosition',
		invalidates: [['engsym']],
		rule: () => {},
	},
	rotation: {
		iri: 'http://rdf.equinor.com/ui/hasRotation',
		invalidates: [['engsym']],
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
