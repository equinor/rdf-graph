import {
	createRdfGraphHoc,
	createRdfViewHoc,
} from '../core/components/RdfGraphHoc';
import { F3DGraph } from './F3DGraph';

export const Rdf3dGraph = createRdfGraphHoc(F3DGraph);
export const Rdf3dGraphView = createRdfViewHoc(Rdf3dGraph);
