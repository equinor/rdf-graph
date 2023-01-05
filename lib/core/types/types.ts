import { BindFunction } from 'core/PatchGraphMonad';
import { Quad, Quad_Object, Quad_Subject } from 'n3';

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

type PropType = 'known' | 'derived' | 'custom';

type BaseProp<TType extends PropType, TValue> = {
	type: TType;
	key: string;
	value: TValue;
};

type KnownProp = BaseProp<'known', string[]> & {
	key:
		| 'label'
		| 'description'
		| 'fill'
		| 'stroke'
		| 'rotation'
		| 'symbolId'
		| 'connectorIds'
		| 'connectorName';
};

type CustomProp = BaseProp<'custom', string[]> & {};

type SymbolProp = BaseProp<'derived', Symbol> & { key: 'symbol' };

type DerivedProp =
	| SymbolProp
	| (BaseProp<'derived', number> & { key: 'connectorDirection' })
	| (BaseProp<'derived', Point> & { key: 'connectorRelativePosition' });

// export type KnownProps = Partial<{
// 	// Basic visualization props
// 	label: string;
// 	description: string;
// 	fill: string;
// 	stroke: string;
// 	rotation: number;

// 	// Props intended for symbol nodes
// 	connectors: string[];
// 	symbolId: string;
// 	symbol: Symbol;

// 	// Props intended for connectors
// 	connectorName: string;
// 	connectorDirection: number;
// 	connectorRelativePosition: Point;

// 	// Ref to the group it is part of
// 	group: GraphNode;
// }>;

type Prop = KnownProp | DerivedProp | CustomProp;

type KnownPropKey = KnownProp['key'];

type DerivedPropKey = DerivedProp['key'];

export type ElementType = 'node' | 'edge';

export type GraphElementBase<TElement extends ElementType> = {
	id: string;
	type: TElement;
};

export type NodeVariant = 'default' | 'connector' | 'symbol' | 'group';

export type NodeVariantInternal = NodeVariant | 'predicate';

export type GraphNodeBase<TNodeVariant extends NodeVariantInternal> = GraphElementBase<'node'> & {
	//iri of subject or object
	variant: TNodeVariant;
	props: Prop[];
};

export type DefaultNode = GraphNodeBase<'default'> & {};

export type SymbolNode = GraphNodeBase<'symbol'> & {};

export type GroupNode = GraphNodeBase<'group'> & {};

export type ConnectorNode = GraphNodeBase<'connector'> & {
	symbolNodeRef: SymbolNode;
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

export type GraphElement = GraphNode | GraphEdge;

export type GraphElementInternal = GraphNode | PredicateNode | GraphEdge;

export interface GraphPatch {
	action: 'add' | 'remove';
	content: GraphNodePatch | GraphEdgePatch | GraphPropertyPatch;
}

type GraphPatchType = ElementType | 'property';

type GraphPatchBase<TType extends GraphPatchType> = {
	id: string;
	type: TType;
};

type GraphNodePatch = GraphPatchBase<'node'> & {
	variant: NodeVariant;
};

type GraphEdgePatch = GraphPatchBase<'edge'> & {
	predicateIri: string;
	sourceId: string;
	targetId: string;
};

type GraphPropertyPatch = GraphPatchBase<'property'> & {
	prop: Prop;
};

export type GraphState = {
	predicateNodeStore: Record<string, PredicateNode>;
	nodeStore: Record<string, GraphNode>;
	edgeStore: Record<string, GraphEdge>;
};

export type RdfPatch = {
	action: 'add' | 'remove';
	data: Quad;
};

export type RuleInputs = { nodeIri: string, symbolProvider: SymbolProvider };
export type PropRule = (target: RuleInputs) => BindFunction;

export type KnownPropConfig = {
	iri: string;
	rule?: PropRule;
};

export type DerivedPropConfig = {
	rule: PropRule;
};

export type PatchGraphResult = {
	graphState: GraphState;
	graphPatches: GraphPatch[];
};

export const knownPropConfig: Record<KnownPropKey, KnownPropConfig> = {
	symbolId: {
		iri: 'http://rdf.equinor.com/ui/hasEngineeringSymbol',
		rule: (ruleInputs: RuleInputs) => derivedPropConfig['symbol'].rule(ruleInputs)
	},
	connectorIds: {
		iri: 'http://rdf.equinor.com/ui/hasConnector',
	},
	connectorName: {
		iri: 'http://rdf.equinor.com/ui/hasConnectorName',
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

const findSingleKnownProp = (node: GraphNode, key: KnownPropKey) => {
	const prop = node.props.find(p => p.type === 'known' && p.key === key);
	if (prop?.value) {
		return ((prop?.value) as string[])[0] 	
	}
	return undefined;
}

export const derivedPropConfig: Record<DerivedPropKey, DerivedPropConfig> = {
	symbol: {
		rule: ({nodeIri, symbolProvider}: RuleInputs) => {	
				return (state: PatchGraphResult) => {
					const { subjectIri, predicateIri, objectTerm } = getTripleAsString(rdfPatch);
					let bindings: BindFunction[] = [];
			
					// Remove quot
					const key = knownPropKeys.find((k) => PROPS[k].iri === predicateIri);
					const config = knownPropConfig[key!];
			
					if (!config.rule) {
						return new PatchGraphMonad(state);
					}
			
					const store = state.graphState.nodeStore;
					const node = store[subjectIri];
					const symbolId = findSingleKnownProp(node, 'symbolId');
					const rotation = findSingleKnownProp(node, 'rotation')
					if (symbolId) {
						symbolProvider(symbolId, rotation);
					}

≈			
					const target: RuleInputs = {
						node: node,
						propKey: key!,
						symbolProvider: symbolProvider
					};
			
					return new PatchGraphMonad(state).bind(config.rule(target));
				};
			}
		}
	}
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
