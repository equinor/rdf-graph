export const martinsTurtle = `
@prefix example: <http://example.com#> .
@prefix imf:     <http://example.com/imf#> .
@prefix owl:     <http://www.w3.org/2002/07/owl#> .
@prefix raphael: <https://rdf.equinor.com/raphael-test-only#> .
@prefix rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix ui:      <http://rdf.equinor.com/ui/> .

example:Hallais
	ui:color "pink";
	rdfs:label "Mr pink" .

example:Hei
	ui:color "white";
	rdfs:label "Mr. white";
	example:connectedTo example:Hallais .

example:Text
	ui:color "purple";
	rdfs:label "PURPLE Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vitae efficitur sem. Nullam vitae felis faucibus, blandit enim nec," .

example:Bilde
	rdfs:label "Mr. picture";
	ui:hasSimpleSvg 'https://dugtrioexperimental.blob.core.windows.net/graph-icons/esd-draft/logicsymbols/LogicPort-OR.svg';
	example:connectedTo example:Hallais .

example:connectedTo
        ui:color "pink" .
`;
