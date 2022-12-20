import { Button, EdsProvider, Radio } from '@equinor/eds-core-react';
import { useNavigate } from 'react-router-dom';
import { DataFactory } from 'n3';
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';

// import appCss from './App.module.css';
import { getUis, UiKey } from '../../setup';
import { useContext } from 'react';
import { GraphContext } from '../../context/GraphContext';

import { PROPS } from '@rdf-graph/types/types';

const { quad: q, literal: l, namedNode: n } = DataFactory;

const uis = getUis();

export const Menu = ({ ui }: { ui: UiKey }) => {
	const navigate = useNavigate();
	const graphCtx = useContext(GraphContext);

	const onChange = (uiKey: UiKey) => {
		navigate('/' + uiKey);
	};

	const addNewNode = (id?: string) => {
		const shortName = uniqueNamesGenerator({
			dictionaries: [adjectives, animals, colors], // colors can be omitted here as not used
			length: 2,
		});
		const shortName2 = uniqueNamesGenerator({
			dictionaries: [adjectives, animals, colors], // colors can be omitted here as not used
			length: 2,
		});
		graphCtx.setRdfPatches([
			{
				action: 'add',
				data: q(n('http://example.com/animals/' + shortName), n(PROPS.label.iri), l(shortName)),
			},
			{
				action: 'add',
				data: q(
					n('http://example.com/animals/' + shortName),
					n('connectedTo'),
					n('http://example.com/animals/' + shortName2)
				),
			},
		]);
	};

	return (
		<EdsProvider density="compact">
			<div>
				{uis.map(({ key, name }) => (
					<Radio
						key={key}
						label={name}
						name="group"
						value={key}
						checked={ui === key}
						onChange={() => onChange(key)}
					/>
				))}
			</div>
			<Button onClick={() => addNewNode()}>Add Node</Button>
		</EdsProvider>
	);
};
