import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import AuthProvider from '../../auth/AuthProvider';

import { SparqlGraph } from './SparqlGraph';

export default {
	title: 'Graph',
	component: SparqlGraph,
	decorators: [(Story) => <AuthProvider>{Story()}</AuthProvider>],
	argTypes: {
		query: { control: { type: 'text' } },
		layout: { control: { type: 'inline-radio' } },
	},
} as ComponentMeta<typeof SparqlGraph>;

const Template: ComponentStory<typeof SparqlGraph> = ({ ...args }) => (
	<>
		<SparqlGraph {...args} />
	</>
);

export const Example = Template.bind({});

Example.args = {
	query: `\n    PREFIX example:<http://example.com#>\n    PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#>\n    PREFIX stid:<http://rdf.equinor.com/raw/stid/JSON_PIPELINE#>\n    PREFIX ui: <http://rdf.equinor.com/ui/>\n\n    CONSTRUCT {\n      example:1a rdfs:label "test1a"; stid:tagType 'L';.\n      example:2a rdfs:label "test2a"; ui:color 'yellow' .\n      example:1b rdfs:label "test1b"; ui:color 'pink' .\n      example:2b rdfs:label "test2b"; ui:color 'blue' .\n\n      example:parent rdfs:label "parent"; ui:color 'green' .\n\n      example:1 rdfs:label "1label"; ui:color 'red' .\n      example:2 rdfs:label "2label"; ui:color 'cyan' .\n\n      example:1a ui:parent example:1 .\n      example:1b ui:parent example:1 .\n      example:2a ui:parent example:2 .\n      example:2b ui:parent example:2 .\n\n      example:1 ui:parent example:parent .\n      example:2 ui:parent example:parent .\n\n      example:1a example:connection example:2a .\n      example:1b example:connection example:2b .\n    }\n    WHERE {\n    }`,
	preferredView: {
		json: 'table',
		turtle: 'graph',
		other: 'raw',
	},
	environment: 'stid-dev',
	layout: 'Cola',
	refresh: 1,
	hasStrictMode: false,
	transformations: undefined,
	setStatus: () => console.log(1),
};

Example.storyName = 'Graph';
