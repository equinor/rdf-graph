import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { SparqlWrapperProps, StoryWrapper } from './StoryWrapper';

import { GoGraph } from '../components/GoGraph';

import { esd_turtle_border as esd_turtle } from './data/esd-turtle';

import { martinsTurtle } from './data/martins_verden_turtle';

//import { lorentz_turtle_2 } from './data/lorentz_ttl_2';

import { lorentz_turtle_3 } from './data/lorentz_ttl_3';

import { Assertion, GraphProperty, GraphPropertyTarget, GraphSelection } from '../../core/types';
import { GoGraphLayout } from '../layout';

export default {
	title: 'GoGraph',
	component: GoGraph,
	decorators: [(Story) => <div>{Story()}</div>],
	argTypes: {
		turtleString: { control: { type: 'text' } },
		layout: {
			control: { type: 'inline-radio' },
			options: [GoGraphLayout.ForceDirected, GoGraphLayout.LayeredDigraph],
		},
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
	layout: GoGraphLayout.ForceDirected,
} as SparqlWrapperProps;
martinsVerden.storyName = 'Martins Verden';

export const lorentzCorner = Template.bind({});
lorentzCorner.args = {
	turtleString: lorentz_turtle_3, //,storyTurtle
	layout: GoGraphLayout.ForceDirected,
} as SparqlWrapperProps;
lorentzCorner.storyName = `Lorentz Corner`;

export const esdStory = Template.bind({});
esdStory.args = {
	turtleString: esd_turtle, // NOTE! File not in version control...
	layout: GoGraphLayout.LayeredDigraph,
	selectionEffect: selectionEffect,
} as SparqlWrapperProps;
esdStory.storyName = 'ESD';

function selectionEffect(sel: GraphSelection) {
	const effect: Assertion<GraphProperty<GraphPropertyTarget>>[] = [];
	const visited = new Set<string>(sel.map((el) => el.id));
	const stack = [...sel];

	while (stack.length > 0) {
		const el = stack.pop()!;
		if (el.type === 'node') {
			effect.push({ action: 'add', assertion: { type: 'property', target: el, key: 'highlight', value: true } });
			for (const edges of el.outgoing.values())
				for (const edge of edges) {
					if (visited.has(edge.id)) continue;
					visited.add(edge.id);
					stack.push(edge);
				}
		}
		if (el.type === 'edge') {
			effect.push({ action: 'add', assertion: { type: 'property', target: el, key: 'highlight', value: true } });
			if (visited.has(el.target)) continue;
			visited.add(el.target);
			stack.push(el.targetRef);
		}
	}
	return effect;
}
