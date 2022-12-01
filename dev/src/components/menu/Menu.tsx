import { EdsProvider, Radio } from '@equinor/eds-core-react';
import { useNavigate } from 'react-router-dom';

// import appCss from './App.module.css';
import { getUis, UiKey } from '../../setup';

const uis = getUis();

export const Menu = ({ ui }: { ui: UiKey }) => {
	const navigate = useNavigate();
	const onChange = (uiKey: UiKey) => {
		navigate('/' + uiKey);
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
		</EdsProvider>
	);
};
