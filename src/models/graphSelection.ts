import { Quad } from 'n3';
import { RdfNodeDataDefinition } from './cytoscapeApi.types';

export class GraphSelection {
	constructor(readonly individuals: RdfNodeDataDefinition[], readonly edges: Quad[]) {}
}
