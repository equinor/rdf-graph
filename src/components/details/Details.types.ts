import { Binding } from '../../models';

export interface DetailsProps {
	resultAsString: string;
	isAlphabetised?: boolean;
}

export type VariableNameType = 'key' | 'value';

export type SparqlResultBindingProps = {
	variableName: VariableNameType;
};

export interface SparqlValueProps {
	sparqlBinding: Binding;
}
