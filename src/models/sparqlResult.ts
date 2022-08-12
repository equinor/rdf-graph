import { SparqlType } from './sparqlType';

export type Binding = {
	variableName: string;
	type: SparqlType;
	datatype: string;
	value: string;
	[index: string]: any;
};

export type Result = {
	bindings: Binding[];
};

export type SparqlResult = {
	headers: string[];
	results: Result[];
};

export const emptySparqlResult = { headers: [], results: [] };
