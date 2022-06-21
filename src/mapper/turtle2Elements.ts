import { ElementDefinition } from 'cytoscape';
import { rdfTriples2Elements } from './rdfTriples2Elements';
import { turtle2RdfTriplesAsync } from './turtle2RdfTriples';

export const turtle2Elements = async (turtle: string): Promise<ElementDefinition[]> => {
	const rdfTriples = await turtle2RdfTriplesAsync(turtle);
	return rdfTriples2Elements(rdfTriples);
};
