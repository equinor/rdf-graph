import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { GoStoryWrapperProps, StoryWrapper } from './StoryWrapper';

import { martinsTurtle } from './data/martins_verden_turtle';
import { connectorSymbols_ttl } from './data/connectorSymbols_ttl';
import { GoGraph } from '../components/goGraph/GoGraph';

export default {
	title: 'RdfGoGraph',
	component: GoGraph,
	decorators: [(Story) => <div>{Story()}</div>],
	argTypes: {
		turtleString: { control: { type: 'text' } },
	},
} as ComponentMeta<typeof GoGraph>;

const Template: ComponentStory<typeof StoryWrapper> = ({ ...args }) => (
	<>
		<StoryWrapper {...args} />
	</>
);

export const martinsVerden = Template.bind({});
martinsVerden.args = {
	turtleString: martinsTurtle,
} as GoStoryWrapperProps;

martinsVerden.storyName = 'Martins Verden';

export const connectorSymbols = Template.bind({});
connectorSymbols.args = {
	turtleString: connectorSymbols_ttl,
} as GoStoryWrapperProps;
connectorSymbols.storyName = `Connector symbols`;
