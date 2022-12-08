import { Quad } from 'n3';

export type ElementType = 'node' | 'edge';

export type GraphElementBase<TNode extends ElementType> = {
	id: string;
	type: TNode;
	/** No explicit types for properties in internal state */
	//props: { [key: string]: unknown };
	/** Should this be stored ??? Maybe just forward */
	data: Map<string, string>;
};

type NodeVariant = 'default' | 'connector' | 'group';

type BasicProps = {
	label: string;
	description: string;
	fill: string;
	stroke: string;
};

type BaseNode<TVariant extends NodeVariant> = GraphElementBase<'node'> & {
	variant: TVariant;
	props: BasicProps & {
		parent?: GraphNode;
	};
};

export type DefaultNode = BaseNode<'default'> & {
	props: {
		connectors: [];
		connectorSymbol: string;
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
	//sourceRef: GraphNode;
	targetId: string;
	//targetRef: GraphNode;
	props: BasicProps;
};

export type GraphNode = DefaultNode | ConnectorNode;

export type GraphElement = GraphNode | GraphEdge;

export type GraphProperty<TTarget extends GraphElement> = {
	type: 'property';
	/** The target graph element instance, i.e. GraphNode or GraphEdge */
	target: TTarget;
	key: keyof TTarget['props'];
	value: unknown;
};

export type GraphDataProperty<TTarget extends GraphElement> = {
	type: 'data';
	target: TTarget;
	key: string;
	value: string;
};

interface GraphPatchBase<T> {
	action: 'add' | 'remove';
	element: T;
}

export type GraphPatch = GraphPatchBase<
	GraphNode | GraphEdge | GraphProperty<GraphElement> | GraphDataProperty<GraphElement>
>;

export type GraphState = {
	nodeStore: Map<string, GraphNode>;
	edgeStore: Map<string, GraphEdge>;
};

export type RdfPatch = {
	action: 'add' | 'remove';
	data: Quad;
};

type NodeProp = keyof BasicProps | keyof DefaultNode['props'] | keyof ConnectorNode['props'];

const a: NodeProp[] = ['fill'];
