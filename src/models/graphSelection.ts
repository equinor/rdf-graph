import { Quad } from 'n3';
import { Node } from './node';

export class GraphSelection {
	constructor(readonly individuals: Node[], readonly edges: Quad[]) {}
}
