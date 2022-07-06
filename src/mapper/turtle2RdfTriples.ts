import { Parser, DataFactory, PrefixCallback } from 'n3';
export function turtle2RdfTriples(turtle: string) {
	const prefixes = new Map<string, string>();
	const pc: PrefixCallback = (prefix, node) => {
		prefixes.set(prefix, node.value);
	};
	const namedNode: typeof DataFactory.namedNode = (value) => {
		const cpos = value.indexOf(':');
		const pfx = value.substring(0, cpos);
		let namespace: string | undefined;
		switch (pfx) {
			case 'http':
			case 'https':
				return DataFactory.namedNode(value);
			case '':
				namespace = prefixes.get('base');
				break;
			default:
				namespace = prefixes.get(pfx);
				break;
		}
		if (!namespace) return DataFactory.namedNode(value);
		return DataFactory.namedNode((namespace + value.substring(cpos + 1)) as typeof value);
	};
	const parser = new Parser({ format: 'Turtle', factory: { ...DataFactory, namedNode } });
	return parser.parse(turtle, undefined, pc);
}
