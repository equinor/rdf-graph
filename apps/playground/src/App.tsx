import { EdsProvider } from '@equinor/eds-core-react';
import { useParams } from 'react-router-dom';
import appCss from './App.module.css';
import { CyUi } from './components/cy/CyUi';
import { Fg3dUi } from './components/fg3d/Fg3dUi';
import { GoUi } from './components/go/GoUi';
import { MenuSide } from './components/menu-side/MenuSide';
import { MenuTop } from './components/menu-top/MenuTop';
import { GraphContextProvider } from './context/GraphContext';
import { UiKey } from './setup';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function App() {
	const { ui } = useParams<{ ui: UiKey }>();
	return (
		<QueryClientProvider client={new QueryClient()}>
			<GraphContextProvider>
				<div className={appCss.wrapper}>
					<div className={appCss.menu}>
						<MenuTop ui={ui ?? 'go'} />
					</div>
					<div className={appCss.main}>
						<div className={appCss.uiContainer}>
							{ui !== undefined
								? {
									fg3d: <Fg3dUi />,
									go: <GoUi />,
									cy: <CyUi />,
								}[ui]
								: null}
						</div>
						<div className={appCss.sideMenu}>
							<EdsProvider density="compact">
								<MenuSide />
							</EdsProvider>
						</div>
					</div>
				</div>
			</GraphContextProvider>
		</QueryClientProvider>
	);
}

export default App;
