import { useState, useEffect } from 'react';
import { UiSymbol } from '@equinor/rdf-graph';
import { useEngineeringSymbolsQuery } from '../symbol-api/query/engSymbolQuery';

type EngineeringSymbolsResult = {
	data?: UiSymbol[];
	symbolProvider: (id: string, _rotation?: number) => UiSymbol | undefined;
	status: 'error' | 'success' | 'pending';
	isLoading: boolean;
	isFetching: boolean;
	isPaused: boolean;
	isError: boolean;
	isSuccess: boolean;
	error: Error | null;
};

let cachedSymbols: UiSymbol[] = [];

export function useEngineeringSymbols(): EngineeringSymbolsResult {
	const [symbols, setSymbols] = useState<UiSymbol[]>(cachedSymbols);

	const { status, data, error, isFetching, isPaused, isError, isSuccess, isLoading } =
		useEngineeringSymbolsQuery();

	useEffect(() => {
		if (!data) return;
		setSymbols(data);
		cachedSymbols = data;
		//console.log('useEngineeringSymbols: useEffect: symbols', data);
	}, [data]);

	const symbolProvider = (id: string, _rotation?: number) => {
		// IGNORE ROTATION for GoJS!
		const symbol = symbols.find((s) => s.id === id);
		return symbol;
	};

	return {
		data: symbols,
		symbolProvider,
		status,
		isFetching,
		isLoading,
		isPaused,
		isError,
		isSuccess,
		error,
	};
}
