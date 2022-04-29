import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { StoryWrapper } from './StoryWrapper';
import { SymbolKey } from '../../symbol-api/symbol-library';

export default {
	title: 'Graph',
	component: StoryWrapper,
	decorators: [(Story) => <div>{Story()}</div>],
	argTypes: {
		turtleString: { control: { type: 'text' } },
		layoutName: { control: { type: 'inline-radio' } },
	},
} as ComponentMeta<typeof StoryWrapper>;

const Template: ComponentStory<typeof StoryWrapper> = ({ ...args }) => (
	<>
		<StoryWrapper {...args} />
	</>
);

export const Example = Template.bind({});

const storyTurtle = `
@prefix example:  <http://example.com#> .
@prefix owl:      <http://www.w3.org/2002/07/owl#> .
@prefix rdf:      <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs:     <http://www.w3.org/2000/01/rdf-schema#> .
@prefix ui:       <http://rdf.equinor.com/ui/> .
@prefix xml:      <http://www.w3.org/XML/1998/namespace> .
@prefix xsd:      <http://www.w3.org/2001/XMLSchema#> .

# Node that provides 3 phase
example:1  rdfs:label  "Well" ;
        ui:color    "brown" ;
        example:connectedTo example:3phaseIn .

example:valve  rdfs:label  "Valve";
        ui:hasSvg "${SymbolKey.Valve_3Way_1}";
        ui:hasConnector example:ValveIn;
        ui:hasConnector example:ValveOut .

example:2  rdfs:label  "Stat pipe";
        ui:color    "red".

example:3  rdfs:label  "Oil water processing";
        ui:color    "orange".

example:seperator rdfs:label "seperator";
        ui:hasSvg "${SymbolKey.Separator_1}";
        ui:hasConnector example:3phaseIn;
        ui:hasConnector example:GasOut;
        ui:hasConnector example:OilWaterOut .

example:3phaseIn rdfs:label "3 phase in" ;
        ui:hasConnectorSuffix "c1" .

example:GasOut rdfs:label "Gas out" ;
    ui:hasConnectorSuffix "c2" ;
    example:connectedTo example:ValveIn .

example:OilWaterOut rdfs:label "oil water out" ;
    ui:hasConnectorSuffix "c3" ;
    example:connectedTo example:3 .

example:ValveIn rdfs:label "ValveIn" ;
    ui:hasConnectorSuffix "c1" .

example:ValveOut rdfs:label "ValveOut" ;
    ui:hasConnectorSuffix "c2" ;
    example:connectedTo example:2 .
`;
Example.args = {
	turtleString: storyTurtle,
	layoutName: 'Cose-Bilkent',
};

Example.storyName = 'Graph';
