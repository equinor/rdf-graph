// https://dev-engsym-api.azurewebsites.net/symbols

import { useQuery } from '@tanstack/react-query';
import { UiSymbol } from '@equinor/rdf-graph';
import { jsonLdResponseToUiSymbol } from '../utils/jsonld-to-uisymbol';

export async function fetchEngineeringSymbols(): Promise<UiSymbol[]> {
	const response = await fetch('https://dev-engsym-api.azurewebsites.net/symbols', {
		method: 'GET',
		headers: {
			Accept: 'application/json',
		},
	});

	if (!response.ok) {
		throw new Error(`${response.status} ${response.statusText}`);
	}

	const result = await response.text();

	const json = JSON.parse(result) as unknown;

	if (!json || typeof json !== 'object') {
		throw new Error('fetchEngineeringSymbols: response is not an object');
	}

	const symbols = jsonLdResponseToUiSymbol(json);

	return Promise.resolve(symbols);
}

export function useEngineeringSymbolsQuery() {
	return useQuery<UiSymbol[]>({
		queryKey: ['engineeringSymbols'],
		queryFn: fetchEngineeringSymbols,
	});
}
