import { Parser, Quad } from 'n3';

const removeQuotedPrefixes = (turtle: string): string => {
	return turtle.replace(/@prefix\s*:\s*<"(.*)">/g, '@prefix: <$1>');
};

export const turtle2RdfTriplesAsync = (turtle: string): Promise<Quad[]> => {
	const turtleParser = new Parser({ format: 'Turtle' });
	const correctTurtle = removeQuotedPrefixes(turtle);

	return new Promise((resolve, reject) => {
		const quads: Quad[] = [];
		turtleParser.parse(correctTurtle, (err, data, prefixes) => {
			if (err) {
				reject(err);
			}
			if (data) {
				quads.push(data);
			} else if (prefixes) {
				//Prefixes are always given at the end of stream so it is safe to resolve
				//We can also use these if we need prefixes.
				resolve(quads);
			} else {
				reject('Unknown error in turtle parser');
			}
		});
	});
};
export const turtle2RdfTriples = (turtle: string) => new Parser({ format: 'Turtle' }).parse(turtle);
