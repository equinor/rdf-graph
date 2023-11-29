import { EdsProvider, Radio, Typography } from '@equinor/eds-core-react';
import { useLocation, useNavigate } from 'react-router-dom';

// import appCss from './App.module.css';
import { getUis, UiKey } from '../../setup';
import css from './MenuTop.module.css';
import { useEngineeringSymbols } from '../../hooks/useEngineeringSymbols';

const uis = getUis();

export const MenuTop = ({ ui }: { ui: UiKey }) => {
	const navigate = useNavigate();
	const loc = useLocation();

	const { isLoading } = useEngineeringSymbols();

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

	//const resetState = () => {};

	return (
		<EdsProvider density="compact">
			<div className={css.wrapper}>
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
				{/* <Button onClick={resetState}>Reset</Button> */}
				{isLoading ? (
					<Typography variant="body_short">Loading Engineering Symbols...</Typography>
				) : null}
			</div>
		</EdsProvider>
	);
};
