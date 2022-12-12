import { BasicProps, GraphElement, GraphPatch, GraphProperty, GraphState, NodeProp } from "./types"

const predicates = [
    'http://rdf.equinor.com/ui/hasConnector',
    'http://rdf.equinor.com/ui/hasConnectorName',
    'http://rdf.equinor.com/ui/hasConnectorSymbol',
    'http://rdf.equinor.com/ui/hasParent',
    'http://www.w3.org/2000/01/rdf-schema#label',
    'http://rdf.equinor.com/ui/fill'
] as const;

export type PredicateIri = typeof predicates[number];

export type PredicateRule = (subject: GraphElement) => [GraphPatch[], GraphState];

const predicate2Rule = {
    'http://www.w3.org/2000/01/rdf-schema#label': CreateTrivialRule('label')
}

export const CreateTrivialRule = (elementProp: NodeProp) => {
    const rule = (subject: GraphElement, state: GraphState) => {
        const patch: GraphProperty<GraphElement> = {
            type: "property",
            target: subject,
            key: elementProp,
            value: rdfObject
        }

        const newProp = { key: elementProp, value: rdfObject };
        const newProps = { ...subject.props, newProp };


        let node = state.nodeStore.get(subject.id);
        if (!node) throw new Error(`Unable to get node from node store using id ${subject.id}`);

        node.props[elementProp] = rdfObject;

        return [
            [patch],
            state
        ]
    }

    return rule;
}