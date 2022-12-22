import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { createBrowserRouter, redirect, RouteObject, RouterProvider } from 'react-router-dom';
import { rdfGraphUis } from './setup';
import { TabEdit } from './components/tab-edit/TabEdit';
import { TabGraphState } from './components/tab-graph-state/TabGraphState';

const uiSlugs = Object.keys(rdfGraphUis);

const fallbackRoute = '/' + uiSlugs[0] + '/edit';

type RouteObjectExtended = RouteObject & { title: string };

export const pages: RouteObjectExtended[] = [
	{ path: 'edit', element: <TabEdit />, title: 'Edit' },
	{ path: 'cases', element: <h1>Cases</h1>, title: 'Cases' },
	{ path: 'history', element: <h1>Hist</h1>, title: 'RDF History' },
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
