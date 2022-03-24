import HylarWS from '../lib/HylarWS';

import { TransformationsDefinition } from '../models';

export async function applyReasoning(content: string, transformations: TransformationsDefinition[]) {
	const hylar = new HylarWS();
	await hylar.load(content, 'text/turtle', false);

	for (const { name, transform } of transformations.filter((t) => t.checked)) {
		console.log('adding rule ', name, ' with definition:\n', transform);
		await hylar.parseAndAddRule(transform, name);
	}

	const query_result = await hylar.query('construct {?s ?p ?o} where {?s ?p ?o}');
	console.log('Load result: ', query_result);
	// @ts-ignore
	return query_result.toNT();
}
