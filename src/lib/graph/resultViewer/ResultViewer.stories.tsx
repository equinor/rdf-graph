import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { ResultViewer } from '..';

export default {
	title: 'Graph',
	component: ResultViewer,
	decorators: [(Story) => Story()],
	// argTypes: {
	// 	color: {
	// 		options: ['dark', 'light'],
	// 		control: { type: 'inline-radio' },
	// 	},
	// 	size: { control: { type: 'inline-radio' } },
	// },
} as ComponentMeta<typeof ResultViewer>;

const Template: ComponentStory<typeof ResultViewer> = ({ ...args }) => <ResultViewer {...args} />;

export const Example = Template.bind({});

Example.args = {
	preferredView: 'preferredView',
	environment: 'environment',
	refresh: 'refresh',
	query: 'query',
};

Example.storyName = 'Graph';
