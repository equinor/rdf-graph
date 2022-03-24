import { EnvironmentsViewProps } from '../../components';
import { useTurtleParser } from '../../hooks';
import { executeSparql } from '../../network';
import { Edge } from '../../models';

export const loadAdjacentData = async (
	target: string,
	oldEdgeIds: string[],
	selectedEdgeTypes: string[],
	limit: number,
	environment: EnvironmentsViewProps
): Promise<Edge[]> => {
	const turtle2Edges = useTurtleParser();
	const filter = `FILTER (?edgeName IN (${selectedEdgeTypes.map((x) => '<' + x + '>').join(',')}))`;

	const tripleQuery = `prefix : <http://rdf.equinor.com/raw/stid/JSON_PIPELINE#>
  prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>

  CONSTRUCT {
    <${target}> ?edgeName ?out . ?out rdfs:label ?oTag ; :tagType ?oType . 
    ?in ?edgeName <${target}> ; rdfs:label ?iTag ; :tagType ?iType . 
  } 
  WHERE {
    optional { <${target}> ?edgeName ?out . optional { ?out :tagNo ?oTag ; :tagType ?oType. } . } .
    optional { ?in ?edgeName <${target}> . optional { ?in :tagNo ?iTag ; :tagType ?iType } . } .
    ${filter}
  }
  LIMIT ${limit}`;

	const edgeCandidates = await executeSparql(tripleQuery, environment).then((d) => turtle2Edges(d.content));

	return edgeCandidates.filter((candidate) => candidate.id() && !oldEdgeIds.includes(candidate.id()));
};
