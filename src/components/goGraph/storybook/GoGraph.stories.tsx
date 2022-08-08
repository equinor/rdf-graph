import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { StoryWrapper } from './StoryWrapper';

import { GoGraph } from '../GoGraph';

import { esd_turtle } from './data/esd-turtle';
import { martinsTurtle } from './data/martins_verden_turtle';
import { GraphLayouts } from '../../../config/Layout';
import { GraphSelection, Assertion, GraphProperty } from '../../../models/graphModel';

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
		const effect: Assertion<GraphProperty>[] = [];
		const visited = new Set<string>(sel.map((el) => el.id));
		const stack = [...sel];
		while (stack.length > 0) {
			const el = stack.pop()!;
			if (el.type === 'node') {
				effect.push({ action: 'add', assertion: { type: 'property', node: el, key: 'highlightStrokeColor', value: 'red' } });
				for (const edges of el.outgoing.values())
					for (const edge of edges) {
						if (visited.has(edge.id)) continue;
						visited.add(edge.id);
						stack.push(edge);
					}
			}
			if (el.type === 'edge') {
				effect.push({ action: 'add', assertion: { type: 'property', node: el, key: 'highlightStrokeColor', value: 'red' } });
				if (visited.has(el.target)) continue;
				visited.add(el.target);
				stack.push(el.targetRef);
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
