import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { StoryWrapper } from './StoryWrapper';

import { GoGraph } from '../GoGraph';

import { esd_turtle } from './data-no-vc/esd-turtle';
import { martinsTurtle } from './data/martins_verden_turtle';
import { GoGraphLayoutType } from '../GoGraph.types';

export default {
	title: 'GoGraph',
	component: GoGraph,
	decorators: [(Story) => <div>{Story()}</div>],
	argTypes: {
		turtleString: { control: { type: 'text' } },
		layout: { control: { type: 'inline-radio' }, options: [GoGraphLayoutType.ForceDirectedLayout, GoGraphLayoutType.LayeredDigraphLayout] },
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
	layout: GoGraphLayoutType.ForceDirectedLayout,
};
martinsVerden.storyName = 'Martins Verden';

export const esdStory = Template.bind({});
esdStory.args = {
	turtleString: esd_turtle, // NOTE! File not in version control...
	layout: GoGraphLayoutType.LayeredDigraphLayout,
};
esdStory.storyName = 'ESD';

export const dmzStory = Template.bind({});

dmzStory.args = {
	turtleString: esd_turtle, // NOTE! File not in version control...
	layout: GoGraphLayoutType.LayeredDigraphLayout,
};
dmzStory.storyName = 'DMZ Magic';
