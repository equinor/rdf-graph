import { GraphPatch } from '@equinor/rdf-graph';

export function printGraphPatchesToConsole(patches: GraphPatch[]) {
	patches.forEach((p) => {
		let a = '%c ';
		a += p.action === 'add' ? 'ADD ' : 'REM ';
		switch (p.content.type) {
			case 'node':
				a += 'node (' + p.content.variant + ') ' + p.content.id;
				break;
			case 'edge':
				a +=
					'Edge ' + p.content.predicateIri + ' ' + p.content.sourceId + ' > ' + p.content.targetId;
				break;

			case 'property':
				a +=
					'prop ' +
					p.content.prop.key +
					' ' +
					p.content.prop.type +
					' ' +
					p.content.id +
					' ' +
					p.content.prop.value.toString().substring(0, 40);
				break;

			default:
				break;
		}

		let style = 'color: lightgreen;';

		if (p.action === 'remove') style = 'color: pink;';
		console.log(a, style);
	});
}
