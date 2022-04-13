import { ElementDefinition } from 'cytoscape';
import { rdfTriples2Elements } from './rdfTriples2Elements';
import { turtle2RdfTriples } from './turtle2RdfTriples';

export const turtle2Elements = async (turtle: string): Promise<ElementDefinition[]> => {
	const rdfTriples = await turtle2RdfTriples(turtle);
	return rdfTriples2Elements(rdfTriples);
};
