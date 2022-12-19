import { RdfPatch } from '@rdf-graph/types/types';
import { useEffect, useState } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import appCss from './App.module.css';
import { CyUi } from './components/cy/CyUi';
import { GoUi } from './components/go/GoUi';
import { Menu } from './components/menu/Menu';
import { GraphContextProvider } from './context/GraphContext';
import { UiKey } from './setup';

function App() {
	const { ui } = useParams<{ ui: UiKey }>();
	const [patches, setPatches] = useState<RdfPatch[]>([]);

	useEffect(() => {
		//setPatches([{ action: 'add', data: q(n('S'), n('label'), l('Hello')) }]);
	}, []);

	return (
		<GraphContextProvider>
			<div className={appCss.wrapper}>
				<div className={appCss.menu}>
					<Menu ui={ui ?? 'go'} />
				</div>
				<div className={appCss.uiContainer}>
					{ui !== undefined
						? {
								fg3d: <h1>f3d</h1>,
								go: <GoUi />,
								cy: <CyUi />,
						  }[ui]
						: null}
				</div>
				<div className={appCss.overlayContent}>
					<Outlet />
				</div>
			</div>
		</GraphContextProvider>
	);
}

export default App;
