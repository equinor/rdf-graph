import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { StoryWrapper } from './StoryWrapper';

import { GoGraph } from '../GoGraph';

import { esd_turtle } from './data-no-vc/esd-turtle';
import { martinsTurtle } from './data/martins_verden_turtle';

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

export const martinsVerden = Template.bind({});
martinsVerden.args = {
	turtleString: martinsTurtle, //,storyTurtle
	// layoutName: 'Cose-Bilkent',
};
martinsVerden.storyName = 'Martins Verden';

export const esdStory = Template.bind({});
esdStory.args = {
	turtleString: esd_turtle, // NOTE! File not in version control...
};
esdStory.storyName = 'ESD';
