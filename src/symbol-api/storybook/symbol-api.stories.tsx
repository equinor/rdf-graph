import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { SparqlWrapperProps, StoryWrapper } from '../../goGraph/storybook/StoryWrapper';

import { GoGraph } from '../../goGraph/components/GoGraph';

import { GoGraphLayout } from '../../goGraph/layout';
import { ConnectorSymbol } from '../types/ConnectorSymbol';

import symbolLib from '../symbol-library.json';

export default {
	title: 'Symbol API (go)',
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

export const allSymbols = Template.bind({});
allSymbols.args = {
	turtleString: getSymbolsTurtle(), //,storyTurtle
	layout: GoGraphLayout.Grid,
} as SparqlWrapperProps;
allSymbols.storyName = 'All Symbols';

function getSymbolsTurtle(): string {
	const lib = symbolLib as Record<string, ConnectorSymbol>;

	let turtle = `@prefix example: <http://example.com#> .
@prefix imf:     <http://example.com/imf#> .
@prefix owl:     <http://www.w3.org/2002/07/owl#> .
@prefix raphael: <https://rdf.equinor.com/raphael-test-only#> .
@prefix rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix ui:      <http://rdf.equinor.com/ui/> .
`;

	for (const key in lib) {
		const symbol = lib[key];

		const connectorIris = symbol.connectors.map((v) => 'example:' + symbol.id + '_c' + v.id);

		turtle += '\nexample:' + symbol.id + '\n';
		if (connectorIris.length > 0) turtle += '\t\tui:hasConnector ' + connectorIris.join(', ') + ' ;\n';
		turtle += '\t\trdfs:label "' + symbol.id + '" ;\n';
		turtle += '\t\tui:hasSvg "' + symbol.id + '" .\n\n';

		for (let i = 0; i < connectorIris.length; i++) {
			const iri = connectorIris[i];
			turtle += iri + '\n';
			turtle += '\t\tui:hasConnectorSuffix "' + symbol.connectors[i].id + '" .\n\n';
		}
	}

	console.log(turtle);

	return turtle;
}
