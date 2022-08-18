import { Binding, emptySparqlResult, SparqlResult } from '../types';

const mapBinding = (b: Binding) => {
	return Object.keys(b).map((variableName) => ({
		variableName: variableName,
		type: b[variableName].type,
		datatype: b[variableName].datatype,
		value: b[variableName].value,
	}));
};

export const httpResult2SparqlResult = (result: string): SparqlResult => {
	try {
		if (!result) {
			return emptySparqlResult;
		}

		const json = JSON.parse(result);

		return {
			headers: json.head.vars,
			results: json.results.bindings.map((b: Binding) => ({
				bindings: mapBinding(b),
			})),
		};
	} catch (error) {
		console.log('error', error);
		return emptySparqlResult;
	}
};
