import { Quad } from 'n3';

export type Point = { x: number; y: number };

export interface UiNodeSymbol {
	id: string;
	width: number;
	height: number;
	angle?: number;
	svg?: string;
	/** Symbol as single svg <path> element value */
	geometry?: string;
	connectors: UiNodeConnector[];
}

export interface UiNodeConnector {
	id: string;
	width: number;
	height: number;
	direction: number;
	position: Point | 'Left' | 'Right' | 'Top' | 'Bottom';
}

export type ElementType = 'node' | 'edge';

export type GraphElementBase<TNode extends ElementType> = {
	id: string;
	type: TNode;
	/** No explicit types for properties in internal state */
	//props: { [key: string]: unknown };
	/** Should this be stored ??? Maybe just forward */
	data: Map<string, string>;
};

type NodeVariant = 'default' | 'connector' | 'engsym' | 'group';

export type BasicProps = Partial<{
	label: string;
	description: string;
	fill: string;
	stroke: string;
}>;

type BaseNode<TVariant extends NodeVariant> = GraphElementBase<'node'> & {
	variant: TVariant;
	props: BasicProps & {
		parent?: GraphNode;
	};
};

export type DefaultNode = BaseNode<'default'>;

export type EngSymbolNode = BaseNode<'engsym'> & {
	props: {
		engsymConnectors: string[];
		engsymId: string;
		engsym: UiNodeSymbol;
	};
};

export type ConnectorNode = BaseNode<'connector'> & {
	props: {
		/** The name of the connector */
		engsymConnectorName: string;
	};
};

export type GraphEdge = GraphElementBase<'edge'> & {
	sourceId: string;
	targetId: string;
};

export type GraphNode = DefaultNode | EngSymbolNode | ConnectorNode;

export type GraphElement = GraphNode | GraphEdge;

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

export type PredicateNode = {
	predicate: string;
	edgeIds: string[];
	props: BasicProps;
};

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
	rule: (deps: KnownProp[]) => void;
};

const PROP_CONFIG: Record<KnownProp, KnownPropConfig> = {
	engsymId: {
		iri: 'http://rdf.equinor.com/ui/hasEngineeringSymbol',
		rule: () => {},
	},
	engsym: {
		iri: null,
		rule: () => {},
	},
	engsymConnectors: {
		iri: 'http://rdf.equinor.com/ui/hasConnector',
		rule: (d) => {},
	},
	engsymConnectorName: {
		iri: 'http://rdf.equinor.com/ui/hasConnectorName',
		rule: () => {},
	},
	fill: {
		iri: 'http://rdf.equinor.com/ui/fill',
		rule: () => {},
	},
	stroke: {
		iri: 'http://rdf.equinor.com/ui/stroke',
		rule: () => {},
	},
	label: {
		iri: 'http://www.w3.org/2000/01/rdf-schema#label',
		rule: () => {},
	},
	description: {
		iri: 'http://rdf.equinor.com/ui/description',
		rule: () => {},
	},
	parent: {
		iri: 'http://rdf.equinor.com/ui/hasParent',
		rule: () => {},
	},
};
