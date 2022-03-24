import { FusekiEnvironment } from '../environmentVariables';

export type TransformationsDefinition = {
	name: string;
	transform: string | string[];
	checked?: boolean;
};

export type SparqlQuery = {
	name: string;
	query: string;
	transformations?: TransformationsDefinition[];
	environments: FusekiEnvironment[] | '*';
	isStrictMode?: boolean;
};
