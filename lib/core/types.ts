import { Quad } from 'n3';

export type ElementType = 'node' | 'edge';

export type GraphElementBase<TNode extends ElementType> = {
	id: string;
	type: TNode;
	/** No explicit types for properties in internal state */
	props: { [key: string]: unknown };
	/** Should this be stored ??? Maybe just forward */
	data: Map<string, string>;
};

type NodeVariant = 'default' | 'connector' | 'group' | 'engsym';

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

export type DefaultNode = BaseNode<'default'>

export type Symbol = {
	width: number;
	height: number;
	angle: number;
	svg: string;
	/** Symbol as single svg <path> element value */
	geometry: string;
	connectors: UiNodeConnector[];
}

export interface UiNodeConnector {
	id: string;
	width: number;
	height: number;
	direction: number;
	position: Point | 'Left' | 'Right' | 'Top' | 'Bottom';
}

export type Point = { x: number; y: number };


export type EngineeringSymbolNode = BaseNode<'engsym'> & {
	props: {
		connectors: [];
		symbolId?: string;
		rotation: number;

	};


};

export type ConnectorNode = BaseNode<'connector'> & {
	props: {
		/** The name of the connector */
		engSymbolConnectorName: string;
	};
};

export type GraphEdge = GraphElementBase<'edge'> & {
	sourceId: string;
	targetId: string;
};

export type GraphNode = DefaultNode | ConnectorNode;

export type GraphElement = GraphNode | GraphEdge;

// Include a type parameter to limit allowed values for the key parameter
export type GraphProperty<TTarget extends GraphElement> = {
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
	element: GraphNode | GraphEdge | GraphProperty<GraphElement> | GraphDataProperty;
}

export type PredicateNode = {
	predicate: string,
	edgeIds: string[]
	properties: BasicProps
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
	predicateNodeStore: Record<string, PredicateNode>,
	nodeStore: Record<string, GraphNode>;
	edgeStore: Record<string, GraphEdge>;
};

export type RdfPatch = {
	action: 'add' | 'remove';
	data: Quad;
};

export type NodeProp = keyof BasicProps | keyof DefaultNode['props'] | keyof ConnectorNode['props'];
