import { getAccessToken } from '../auth/msalHelpers';
import { EnvironmentsViewProps } from '../components/sparqlGraph/SparqlGraph.types';
import { contentType2DataType } from '../mapper/contentType2DataType';
import { Data } from '../models/data';
import { getApiConfig } from './apiConfig';

export async function executeSparql(query: string, environment: EnvironmentsViewProps): Promise<Data> {
	const apiConfig = getApiConfig(environment);
	//fetch insist on decoding url, so adding another layer
	const escapedUrlEscaping = query.replaceAll('%', '%25').replaceAll('&', '%26');

	const response = await fetch(apiConfig.baseUrl + '/ds/query  ', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			Authorization: await getAccessToken(apiConfig.scopes),
		},
		body: 'query=' + escapedUrlEscaping,
	});

	if (response.ok) {
		const contentType = response.headers.get('Content-Type');
		const dataType = contentType2DataType(contentType);
		const content = await response.text();
		return { content: content, dataType: dataType };
	}

	const text = await response.text();

	throw Object.assign(new Error('Got status code: ' + response.status + ', error: ' + text), { code: response.status });
}
