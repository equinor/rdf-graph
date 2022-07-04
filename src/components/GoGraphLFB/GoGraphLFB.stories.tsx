import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { GoGraphLFB } from './GoGraphLFB';

export default {
	title: 'GoGraphLFB',
	component: GoGraphLFB,
	decorators: [(Story) => <div>{Story()}</div>],
	argTypes: {
		turtleString: { control: { type: 'text' } },
		layoutName: { control: { type: 'inline-radio' } },
	},
} as ComponentMeta<typeof GoGraphLFB>;

const Template: ComponentStory<typeof GoGraphLFB> = ({ ...args }) => (
	<>
		<GoGraphLFB {...args} />
	</>
);

export const Example = Template.bind({});

// Example.args = {
// 	turtleString: storyTurtle,
// 	// layoutName: 'Cose-Bilkent',
// };

Example.storyName = 'GoGraphLFB';
