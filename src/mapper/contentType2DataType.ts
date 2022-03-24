import { DataType } from '../models';

const map: { [key: string]: DataType } = {
	'application/json': 'json',
	'application/sparql-results+json': 'json',
	'application/sparql-results+json; charset=utf-8': 'json',
	'text/turtle': 'turtle',
};

export const contentType2DataType = (key: string | null): DataType => {
	if (key === null) {
		return 'other';
	}
	return map[key] || 'other';
};
