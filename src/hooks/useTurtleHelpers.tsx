import { Quad } from '@rdfjs/types';
import { Parser } from 'n3';

import { Edge, NodeDescription } from '../models';

export const useTurtleHelpers = () => {
	const turtle2Edges = useTurtleParser();

	return [turtle2Edges] as const;
};
const quad2Edge = (quad: Quad): Edge => {
	return new Edge(quad.subject.value, quad.object.value, quad.predicate.value);
};

const removeQuotedPrefixes = (turtle: string): string => {
	return turtle.replace(/@prefix\s*:\s*<"(.*)">/g, '@prefix: <$1>');
};

export function useTurtleParser(setNodeDescriptions?: (descriptions: NodeDescription[]) => void) {
	return (turtle: string): Promise<Edge[]> => {
		const turtleParser = new Parser({ format: 'Turtle' });
		const correctTurtle = removeQuotedPrefixes(turtle);

		return new Promise((resolve, reject) => {
			const edges: Edge[] = [];
			const nodeDescriptions: NodeDescription[] = [];
			turtleParser.parse(correctTurtle, (err, data, prefixes) => {
				if (err) {
					reject(err);
				}
				if (data) {
					edges.push(quad2Edge(data));
				} else if (prefixes) {
					//Prefixes are always given at the end of stream so it is safe to resolve
					//We can also use these if we need prefixes.
					if (nodeDescriptions.length > 0) {
						setNodeDescriptions && setNodeDescriptions(nodeDescriptions);
					}

					resolve(edges);
				} else {
					reject('Unknown error in turtle parser');
				}
			});
		});
	};
}
