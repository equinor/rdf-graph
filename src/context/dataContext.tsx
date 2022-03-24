import { createContext, FC, ReactNode, useContext, useState } from 'react';

import { NodeDescription } from '../models';

type ProviderProps = {
	children: ReactNode;
};

export type DataContextType = {
	nodeDescriptions: NodeDescription[];
	setNodeDescriptions: (descriptions: NodeDescription[]) => void;
};

export const DataContext = createContext<DataContextType>({
	nodeDescriptions: [],
	setNodeDescriptions: () => console.log('no provider'),
});

export const useDataContext = (): DataContextType => useContext(DataContext);

export const DataContextProvider: FC<ProviderProps> = (props: ProviderProps) => {
	const [nodeDescriptions, setNodeDescriptions] = useState<NodeDescription[]>([]);

	return (
		<DataContext.Provider
			value={{
				nodeDescriptions,
				setNodeDescriptions,
			}}>
			{props.children}
		</DataContext.Provider>
	);
};
