import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { createBrowserRouter, redirect, RouteObject, RouterProvider } from 'react-router-dom';
import { rdfGraphUis } from './setup';
import { TabEdit } from './components/tab-edit/TabEdit';
import { TabGraphState } from './components/tab-graph-state/TabGraphState';
import { TabHistory } from './components/tab-history/TabHistory';
import { TabTurtle } from './components/tab-turtle/TabTurtle';
import { TabRdf } from './components/tab-rdf/TabRdf';

const uiSlugs = Object.keys(rdfGraphUis);

const fallbackRoute = '/' + uiSlugs[0] + '/edit';

type RouteObjectExtended = RouteObject & { title: string };

export const pages: RouteObjectExtended[] = [
	{ path: 'edit', element: <TabEdit />, title: 'Edit' },
	{ path: 'turtle', element: <TabTurtle />, title: 'Turtle' },
	//{ path: 'cases', element: <h1>Cases</h1>, title: 'Cases' },
	{ path: 'history', element: <TabHistory />, title: 'RDF History' },
	{ path: 'rdf-head', element: <TabRdf />, title: 'RDF Head' },
	{ path: 'graph-state', element: <TabGraphState />, title: 'Graph State' },
];

const router = createBrowserRouter([
	{
		path: '/',
		loader: async () => {
			throw redirect(fallbackRoute);
		},
	},
	{
		path: ':ui',
		loader: ({ params }) => {
			if (params.ui === undefined || !uiSlugs.includes(params.ui)) {
				throw redirect(fallbackRoute);
			}
			return null;
		},
		element: <App />,
		children: pages,
	},
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);
