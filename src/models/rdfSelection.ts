import { Edge } from './edge';
import { Node } from './node';

export class GraphSelection {
	constructor(readonly individuals: Node[], readonly edges: Edge[]) {}
}
