import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Details } from '../details/Details';

export default {
	title: 'Details',
	component: Details,
	decorators: [(Story) => <div>{Story()}</div>],
	argTypes: {
		sparqlResult: { control: { type: 'text' } },
	},
} as ComponentMeta<typeof Details>;

const Template: ComponentStory<typeof Details> = ({ ...args }) => (
	<>
		<Details {...args} />
	</>
);

export const Example = Template.bind({});

const storySparqlResult = `{
    "head": {
        "vars": [
            "a",
            "b",
            "c"
        ]
    },
    "results": {
        "bindings": [
            {
                "a": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#domain"
                },
                "b": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#domain"
                },
                "c": {
                    "type": "uri",
                    "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"
                }
            },
            {
                "a": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#domain"
                },
                "b": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#range"
                },
                "c": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#Class"
                }
            },
            {
                "a": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#domain"
                },
                "b": {
                    "type": "uri",
                    "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
                },
                "c": {
                    "type": "uri",
                    "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"
                }
            },
            {
                "a": {
                    "type": "uri",
                    "value": "http://www.w3.org/2002/07/owl#DatatypeProperty"
                },
                "b": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#subClassOf"
                },
                "c": {
                    "type": "uri",
                    "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"
                }
            },
            {
                "a": {
                    "type": "uri",
                    "value": "http://www.w3.org/2002/07/owl#Property"
                },
                "b": {
                    "type": "uri",
                    "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
                },
                "c": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#Class"
                }
            },
            {
                "a": {
                    "type": "uri",
                    "value": "http://www.w3.org/2002/07/owl#Property"
                },
                "b": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#subClassOf"
                },
                "c": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#Resource"
                }
            },
            {
                "a": {
                    "type": "uri",
                    "value": "http://www.w3.org/2002/07/owl#Property"
                },
                "b": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#subClassOf"
                },
                "c": {
                    "type": "uri",
                    "value": "http://www.w3.org/2002/07/owl#Property"
                }
            },
            {
                "a": {
                    "type": "uri",
                    "value": "http://www.w3.org/2002/07/owl#imports"
                },
                "b": {
                    "type": "uri",
                    "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
                },
                "c": {
                    "type": "uri",
                    "value": "http://www.w3.org/2002/07/owl#OntologyProperty"
                }
            },
            {
                "a": {
                    "type": "uri",
                    "value": "http://www.w3.org/2002/07/owl#imports"
                },
                "b": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#domain"
                },
                "c": {
                    "type": "uri",
                    "value": "http://www.w3.org/2002/07/owl#Ontology"
                }
            },
            {
                "a": {
                    "type": "uri",
                    "value": "http://www.w3.org/2002/07/owl#imports"
                },
                "b": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#range"
                },
                "c": {
                    "type": "uri",
                    "value": "http://www.w3.org/2002/07/owl#Ontology"
                }
            },
            {
                "a": {
                    "type": "uri",
                    "value": "http://www.w3.org/2001/XMLSchema#negativeInteger"
                },
                "b": {
                    "type": "uri",
                    "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
                },
                "c": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#Datatype"
                }
            },
            {
                "a": {
                    "type": "uri",
                    "value": "http://www.w3.org/2002/07/owl#ObjectProperty"
                },
                "b": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#subClassOf"
                },
                "c": {
                    "type": "uri",
                    "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"
                }
            },
            {
                "a": {
                    "type": "uri",
                    "value": "http://www.w3.org/2002/07/owl#intersectionOf"
                },
                "b": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#domain"
                },
                "c": {
                    "type": "uri",
                    "value": "http://www.w3.org/2002/07/owl#Class"
                }
            },
            {
                "a": {
                    "type": "uri",
                    "value": "http://www.w3.org/2002/07/owl#backwardCompatibleWith"
                },
                "b": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#domain"
                },
                "c": {
                    "type": "uri",
                    "value": "http://www.w3.org/2002/07/owl#Ontology"
                }
            },
            {
                "a": {
                    "type": "uri",
                    "value": "http://www.w3.org/2002/07/owl#backwardCompatibleWith"
                },
                "b": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#range"
                },
                "c": {
                    "type": "uri",
                    "value": "http://www.w3.org/2002/07/owl#Ontology"
                }
            },
            {
                "a": {
                    "type": "uri",
                    "value": "http://www.w3.org/2002/07/owl#Ontology"
                },
                "b": {
                    "type": "uri",
                    "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
                },
                "c": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#Class"
                }
            },
            {
                "a": {
                    "type": "uri",
                    "value": "http://www.w3.org/2002/07/owl#Ontology"
                },
                "b": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#subClassOf"
                },
                "c": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#Resource"
                }
            },
            {
                "a": {
                    "type": "uri",
                    "value": "http://www.w3.org/2002/07/owl#Ontology"
                },
                "b": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#subClassOf"
                },
                "c": {
                    "type": "uri",
                    "value": "http://www.w3.org/2002/07/owl#Ontology"
                }
            },
            {
                "a": {
                    "type": "uri",
                    "value": "http://www.w3.org/2001/XMLSchema#unsignedLong"
                },
                "b": {
                    "type": "uri",
                    "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
                },
                "c": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#Datatype"
                }
            },
            {
                "a": {
                    "type": "uri",
                    "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#first"
                },
                "b": {
                    "type": "uri",
                    "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
                },
                "c": {
                    "type": "uri",
                    "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"
                }
            },
            {
                "a": {
                    "type": "uri",
                    "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#first"
                },
                "b": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#domain"
                },
                "c": {
                    "type": "uri",
                    "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#List"
                }
            },
            {
                "a": {
                    "type": "uri",
                    "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#first"
                },
                "b": {
                    "type": "uri",
                    "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
                },
                "c": {
                    "type": "uri",
                    "value": "http://www.w3.org/2002/07/owl#FunctionalProperty"
                }
            },
            {
                "a": {
                    "type": "uri",
                    "value": "http://www.w3.org/2002/07/owl#onProperty"
                },
                "b": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#domain"
                },
                "c": {
                    "type": "uri",
                    "value": "http://www.w3.org/2002/07/owl#Restriction"
                }
            },
            {
                "a": {
                    "type": "uri",
                    "value": "http://www.w3.org/2002/07/owl#onProperty"
                },
                "b": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#range"
                },
                "c": {
                    "type": "uri",
                    "value": "http://www.w3.org/2002/07/owl#Property"
                }
            },
            {
                "a": {
                    "type": "uri",
                    "value": "http://www.w3.org/2002/07/owl#differentFrom"
                },
                "b": {
                    "type": "uri",
                    "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
                },
                "c": {
                    "type": "uri",
                    "value": "http://www.w3.org/2002/07/owl#SymmetricProperty"
                }
            },
            {
                "a": {
                    "type": "uri",
                    "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#object"
                },
                "b": {
                    "type": "uri",
                    "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
                },
                "c": {
                    "type": "uri",
                    "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"
                }
            },
            {
                "a": {
                    "type": "uri",
                    "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#object"
                },
                "b": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#domain"
                },
                "c": {
                    "type": "uri",
                    "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Statement"
                }
            },
            {
                "a": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#subPropertyOf"
                },
                "b": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#domain"
                },
                "c": {
                    "type": "uri",
                    "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"
                }
            },
            {
                "a": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#subPropertyOf"
                },
                "b": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#range"
                },
                "c": {
                    "type": "uri",
                    "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"
                }
            },
            {
                "a": {
                    "type": "uri",
                    "value": "http://www.w3.org/2000/01/rdf-schema#subPropertyOf"
                },
                "b": {
                    "type": "uri",
                    "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
                },
                "c": {
                    "type": "uri",
                    "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"
                }
            }
        ]
    }
}
`;

Example.args = {
	resultAsString: storySparqlResult,
	isAlphabetised: false,
};

Example.storyName = 'Details';
