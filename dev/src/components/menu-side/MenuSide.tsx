import { EdsProvider, Tabs } from '@equinor/eds-core-react';
import { useState } from 'react';
import { Link, Outlet, useLocation, Location } from 'react-router-dom';

import { pages } from '../../main';

function getCurrentTabIndex(loc: Location) {
	const page = loc.pathname.split('/').at(-1);
	const index = pages.findIndex((p) => p.path === page);
	return index === -1 ? 0 : index;
}

export const MenuSide = () => {
	const loc = useLocation();
	const [activeTab, setActiveTab] = useState(() => getCurrentTabIndex(loc));

	const handleChange = (index: number) => {
		setActiveTab(index);
	};

	return (
		<EdsProvider density="compact">
			<Tabs activeTab={activeTab} onChange={handleChange}>
				<Tabs.List>
					{pages.map((p) => (
						<Tabs.Tab as={Link} to={p.path!} key={p.path}>
							{p.title}
						</Tabs.Tab>
					))}
				</Tabs.List>
				<Outlet />
			</Tabs>
		</EdsProvider>
	);
};
