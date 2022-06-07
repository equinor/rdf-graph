import { Quad } from 'n3';
import { RdfNodeDataDefinition } from '../cytoscape-api/cytoscapeApi.types';

export class GraphSelection {
	constructor(readonly individuals: RdfNodeDataDefinition[], readonly edges: Quad[]) {}
}
