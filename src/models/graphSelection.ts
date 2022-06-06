import { Quad } from 'n3';
import { RdfNodeDataDefinition } from './cytoscapeExtensions.types';

export class GraphSelection {
	constructor(readonly individuals: RdfNodeDataDefinition[], readonly edges: Quad[]) {}
}
