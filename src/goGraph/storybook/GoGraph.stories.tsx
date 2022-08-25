import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { SparqlWrapperProps, StoryWrapper } from './StoryWrapper';

import { GoGraph } from '../components/GoGraph';

import { esd_turtle_border as esd_turtle } from './data/esd-turtle';
//import * as TURTLE from './data-no-vc/SHUTDOWN_PRES';
import { martinsTurtle } from './data/martins_verden_turtle';

import { Assertion, GraphProperty, GraphSelection } from '../../core/types';
import { GoGraphLayout } from '../layout';

export default {
	title: 'GoGraph',
	component: GoGraph,
	decorators: [(Story) => <div>{Story()}</div>],
	argTypes: {
		turtleString: { control: { type: 'text' } },
		//turtleString: { control: { type: 'inline-radio' }, options: Object.keys('TURTLE'), mapping: 'TURTLE' },
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

export const esdStory = Template.bind({});
esdStory.args = {
	turtleString: esd_turtle, // NOTE! File not in version control...
	layout: GoGraphLayout.LayeredDigraph,
	selectionEffect: (sel: GraphSelection) => {
		const effect: Assertion<GraphProperty>[] = [];
		const visited = new Set<string>(sel.map((el) => el.id));
		const stack = [...sel];

		while (stack.length > 0) {
			const el = stack.pop()!;
			if (el.type === 'node') {
				effect.push({ action: 'add', assertion: { type: 'property', node: el, key: 'highlightStrokeColor', value: '#FF9200' } });
				for (const edges of el.outgoing.values())
					for (const edge of edges) {
						if (visited.has(edge.id)) continue;
						visited.add(edge.id);
						stack.push(edge);
					}
			}
			if (el.type === 'edge') {
				effect.push({ action: 'add', assertion: { type: 'property', node: el, key: 'highlightStrokeColor', value: '#FF9200' } });
				if (visited.has(el.target)) continue;
				visited.add(el.target);
				stack.push(el.targetRef);
			}
		}
		return effect;
	},
} as SparqlWrapperProps;
esdStory.storyName = 'ESD';
