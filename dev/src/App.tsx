import { useParams, Outlet } from 'react-router-dom';
import './App.css';
import { UiKey } from './setup';

function App() {
	const { ui } = useParams<{ ui: UiKey }>();

	return (
		<div className="App">
			{ui !== undefined
				? {
						fg3d: <h1>f3d</h1>,
						go: <h1>GO</h1>,
						cy: <h1>CY</h1>,
				  }[ui]
				: null}
			<Outlet />
		</div>
	);
}

export default App;
