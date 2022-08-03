import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { StoryWrapper } from './StoryWrapper';

import { GoGraph } from '../GoGraph';

import { esd_turtle } from './data/esd-turtle';
import { martinsTurtle } from './data/martins_verden_turtle';
import { GraphLayouts } from '../../../config/Layout';
import { GraphSelection, PropertyAssertion } from '../../../models/graphModel';

export default {
	title: 'GoGraph',
	component: GoGraph,
	decorators: [(Story) => <div>{Story()}</div>],
	argTypes: {
		turtleString: { control: { type: 'text' } },
		layout: { control: { type: 'inline-radio' }, options: [GraphLayouts.ForceDirected, GraphLayouts.LayeredDigraph] },
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
	layout: GraphLayouts.ForceDirected,
};
martinsVerden.storyName = 'Martins Verden';

export const esdStory = Template.bind({});
esdStory.args = {
	turtleString: esd_turtle, // NOTE! File not in version control...
	layout: GraphLayouts.LayeredDigraph,
	selectionEffect: (sel: GraphSelection) => {
		const effect: PropertyAssertion[] = [];
		for (const n of sel) {
			if (n.type === 'node') {
				effect.push({ action: 'add', assertion: { type: 'property', node: n, key: 'highlightStrokeColor', value: 'green' } });
			}
		}
		return effect;
	},
};
esdStory.storyName = 'ESD';

export const dmzStory = Template.bind({});

dmzStory.args = {
	turtleString: esd_turtle, // NOTE! File not in version control...
	layout: GraphLayouts.LayeredDigraph,
};
dmzStory.storyName = 'DMZ Magic';
