import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { createBrowserRouter, redirect, RouterProvider } from 'react-router-dom';
import { rdfGraphUis } from './setup';

const uiSlugs = Object.keys(rdfGraphUis);

const router = createBrowserRouter([
	{
		path: '/',
		loader: async () => {
			throw redirect('/' + uiSlugs[0]);
		},
	},
	{
		path: ':ui',
		loader: ({ params }) => {
			if (params.ui === undefined || !uiSlugs.includes(params.ui)) {
				throw redirect('/' + uiSlugs[0]);
			}
		},
		element: <App />,
		children: [{ path: 'turtle', element: <h1>Turtle</h1> }],
	},
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);
