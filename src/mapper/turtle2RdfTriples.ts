import { Quad } from '@rdfjs/types';
import { Parser } from 'n3';

import { RdfTriple } from '../models';

const quad2Edge = (quad: Quad): RdfTriple => {
	return new RdfTriple(quad.subject.value, quad.predicate.value, quad.object.value);
};

const removeQuotedPrefixes = (turtle: string): string => {
	return turtle.replace(/@prefix\s*:\s*<"(.*)">/g, '@prefix: <$1>');
};

export const turtle2RdfTriples = (turtle: string): Promise<RdfTriple[]> => {
	const turtleParser = new Parser({ format: 'Turtle' });
	const correctTurtle = removeQuotedPrefixes(turtle);

	return new Promise((resolve, reject) => {
		const rdfTriples: RdfTriple[] = [];
		turtleParser.parse(correctTurtle, (err, data, prefixes) => {
			if (err) {
				reject(err);
			}
			if (data) {
				rdfTriples.push(quad2Edge(data));
			} else if (prefixes) {
				//Prefixes are always given at the end of stream so it is safe to resolve
				//We can also use these if we need prefixes.
				resolve(rdfTriples);
			} else {
				reject('Unknown error in turtle parser');
			}
		});
	});
};
