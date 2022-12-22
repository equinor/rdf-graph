import { Button, EdsProvider, Radio, Typography } from '@equinor/eds-core-react';
import { useLocation, useNavigate } from 'react-router-dom';

// import appCss from './App.module.css';
import { getUis, UiKey } from '../../setup';

const uis = getUis();

export const MenuTop = ({ ui }: { ui: UiKey }) => {
	const navigate = useNavigate();
	const loc = useLocation();

	const onChange = (uiKey: UiKey) => {
		const paths = loc.pathname.split('/');
		paths.shift();
		let subPath = '';

		if (paths.length > 1) {
			paths.shift();
			subPath += '/' + paths.join('/');
		} else {
			subPath += '/edit';
		}

		navigate('/' + uiKey + subPath);
	};

	const resetState = () => {};

	return (
		<EdsProvider density="compact">
			<Typography variant="h1">RDF-GRAPH</Typography>
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
			<Button onClick={resetState}>Reset</Button>
		</EdsProvider>
	);
};
