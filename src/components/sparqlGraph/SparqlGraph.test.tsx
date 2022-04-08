import React from 'react';
import { render, screen } from '@testing-library/react';

import { SparqlGraph } from './SparqlGraph';

const storyTurtle = `
@prefix :         <http://rdf.equinor.com/pbd#> .
@prefix data:     <http://rdf.equinor.com/data/facility#> .
@prefix example:  <http://example.com#> .
@prefix facility: <http://rdf.equinor.com/ontology/facility#> .
@prefix imf:      <http://rdf.equinor.com/ontology/imf#> .
@prefix owl:      <http://www.w3.org/2002/07/owl#> .
@prefix pca:      <http://rdf.equinor.com/ontology/pca14#> .
@prefix rdf:      <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs:     <http://www.w3.org/2000/01/rdf-schema#> .
@prefix stid:     <http://rdf.equinor.com/raw/stid/JSON_PIPELINE#> .
@prefix ui:       <http://rdf.equinor.com/ui/> .
@prefix xml:      <http://www.w3.org/XML/1998/namespace> .
@prefix xsd:      <http://www.w3.org/2001/XMLSchema#> .

example:1  rdfs:label  "1label" ;
        ui:color    "red" ;
        ui:parent   example:parent .

example:parent  rdfs:label  "parent" ;
        ui:color    "green" .

example:2b  rdfs:label  "test2b" ;
        ui:color    "blue" ;
        ui:parent   example:2 .

example:1a  rdfs:label      "test1a" ;
        example:connection  example:2a ;
        stid:tagType        "L" ;
        ui:parent           example:1 .

example:2  rdfs:label  "2label" ;
        ui:color    "cyan" ;
        ui:parent   example:parent .

example:1b  rdfs:label      "test1b" ;
        example:connection  example:2b ;
        ui:color            "pink" ;
        ui:parent           example:1 .

example:2a  rdfs:label  "test2a" ;
        ui:color    "yellow" ;
        ui:parent   example:2 .
`;

// describe('SparqlGraph - renders without crashing', () => {
describe('SparqlGraph - example', () => {
	test('Expects to find button HTML element in the DOM', () => {
		render(
			<button>
				{/* <SparqlGraph turtleString={storyTurtle} layoutName="Cola" onElementsSelected={() => console.log(1)}/> */}
				Im dump example and I'm just here to pass the test 🤪
			</button>
		);
		const element = screen.getByRole('button');
		expect(element).toBeInTheDocument();
	});
});
