import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { StoryWrapper } from './StoryWrapper';

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
`;
Example.args = {
	turtleString: storyTurtle,
	layoutName: 'Cose-Bilkent',
};

Example.storyName = 'Graph';
