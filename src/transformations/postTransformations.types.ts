import { ElementDefinition } from 'cytoscape';
import { RdfNodeDefinition } from '../models/cytoscapeExtensions.types';

export type PostTransformation = {
	isApplicable: (e: RdfNodeDefinition) => boolean;
	transformNew: (element: RdfNodeDefinition, others: RdfNodeDefinition[]) => ElementDefinition[];
	transformUpdate: (element: RdfNodeDefinition, others: RdfNodeDefinition[], cy: cytoscape.Core) => void;
};
