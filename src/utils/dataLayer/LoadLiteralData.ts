import { EnvironmentsViewProps } from '../../components';
import { executeSparql } from '../../network';
import { Data } from '../../models';

export const loadLiteralData = (target: string, environment: EnvironmentsViewProps): Promise<Data> => {
	const regex = '^.*[/,#]'; // Everything before last slash or hash
	const query = `
        SELECT (REPLACE(str(?edgeName), "${regex}", "") AS ?key) ?value
        WHERE {
            <${target}> ?edgeName ?value
            FILTER(isLiteral(?value))
        }`;

	return executeSparql(query, environment);
};
