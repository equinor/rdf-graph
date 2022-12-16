import { useParams, Outlet } from 'react-router-dom';
import appCss from './App.module.css';
import { GoUi } from './components/go/GoUi';
import { Menu } from './components/menu/Menu';
import { UiKey } from './setup';

function App() {
	const { ui } = useParams<{ ui: UiKey }>();

	return (
		<div className={appCss.wrapper}>
			<div className={appCss.menu}>
				<Menu ui={ui ?? 'go'} />
			</div>
			<div className={appCss.uiContainer}>
				{ui !== undefined
					? {
							fg3d: <h1>f3d</h1>,
							go: <GoUi />,
							cy: <h1>CY</h1>,
					  }[ui]
					: null}
			</div>
			<div className={appCss.overlayContent}>
				<Outlet />
			</div>
		</div>
	);
}

export default App;
