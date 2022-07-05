import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { StoryWrapper } from './StoryWrapper';

import { GoGraph } from './GoGraph';

import { esd_turtle } from './data-no-vs/esd-turtle';

export default {
	title: 'GoGraph',
	component: GoGraph,
	decorators: [(Story) => <div>{Story()}</div>],
	argTypes: {
		turtleString: { control: { type: 'text' } },
		layoutName: { control: { type: 'inline-radio' } },
	},
} as ComponentMeta<typeof GoGraph>;

const Template: ComponentStory<typeof StoryWrapper> = ({ ...args }) => (
	<>
		<StoryWrapper {...args} />
	</>
);

export const Example = Template.bind({});

const storyTurtle = `
@prefix example: <http://example.com#> .
@prefix imf:     <http://example.com/imf#> .
@prefix owl:     <http://www.w3.org/2002/07/owl#> .
@prefix raphael: <https://rdf.equinor.com/raphael-test-only#> .
@prefix rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix ui:      <http://rdf.equinor.com/ui/> .

example:Separatox3000
        ui:hasConnector   example:Separatox3000ThreePhaseInput ;
        ui:hasConnector  example:Separatox3000LiquidOutput , example:Separatox3000GasOutput ;
        ui:hasSvg              "Separator_1" .

example:Separatox3000LiquidOutput
        ui:hasConnectorSuffix  "c3" .

example:Separatox3000GasOutput
        ui:hasConnectorSuffix  "c2" .

example:Separatox3000ThreePhaseInput
        ui:hasConnectorSuffix  "c1" .

example:Separatox3001
        ui:hasConnector   example:Separatox3001ThreePhaseInput ;
        ui:hasConnector  example:Separatox3001LiquidOutput , example:Separatox3001GasOutput ;
        ui:hasSvg              "Separator_1" .

example:Separatox3001LiquidOutput
        ui:hasConnectorSuffix  "c3" .

example:Separatox3001GasOutput
        ui:hasConnectorSuffix  "c2" .

example:Separatox3001ThreePhaseInput
        ui:hasConnectorSuffix  "c1" ;
		example:connectedTo example:Separatox3000GasOutput .

example:Hallais
	ui:color "pink";
	rdfs:label "Mr pink" .

example:Hei
	ui:color "white";
	rdfs:label "Mr. white";
	example:connectedTo example:Hallais .

example:Text
	ui:color "purple";
	rdfs:label "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vitae efficitur sem. Nullam vitae felis faucibus, blandit enim nec," .

example:Bilde
	rdfs:label "Mr. picture";
	ui:hasSimpleSvg 'https://dugtrioexperimental.blob.core.windows.net/graph-icons/esd-draft/logicsymbols/LogicPort-OR.svg';
	example:connectedTo example:Hallais .

`;

Example.args = {
	turtleString: esd_turtle, //,storyTurtle
	// layoutName: 'Cose-Bilkent',
};

Example.storyName = 'GoGraph';
