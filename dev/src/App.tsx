import { useEffect, useState } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import appCss from './App.module.css';
import { CyUi } from './components/cy/CyUi';
import { GoUi } from './components/go/GoUi';
import { MenuSide } from './components/menu-side/MenuSide';
import { MenuTop } from './components/menu-top/MenuTop';
import { GraphContextProvider } from './context/GraphContext';
import { UiKey } from './setup';

function App() {
	const { ui } = useParams<{ ui: UiKey }>();

	return (
		<GraphContextProvider>
			<div className={appCss.wrapper}>
				<div className={appCss.menu}>
					<MenuTop ui={ui ?? 'go'} />
				</div>
				<div className={appCss.main}>
					<div className={appCss.uiContainer}>
						{ui !== undefined
							? {
									fg3d: <h1>f3d</h1>,
									go: <GoUi />,
									cy: <CyUi />,
							  }[ui]
							: null}
					</div>
					<div className={appCss.sideMenu}>
						<MenuSide />
					</div>
				</div>
				{/* <div className={appCss.overlayContent}>
					<Outlet />
				</div> */}
			</div>
		</GraphContextProvider>
	);
}

export default App;
