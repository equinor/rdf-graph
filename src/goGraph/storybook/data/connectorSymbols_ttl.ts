export const connectorSymbols_ttl = `@prefix example: <http://example.com#> .
@prefix imf:     <http://example.com/imf#> .
@prefix owl:     <http://www.w3.org/2002/07/owl#> .
@prefix raphael: <https://rdf.equinor.com/raphael-test-only#> .
@prefix rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix ui:      <http://rdf.equinor.com/ui/> .

example:CompA
        ui:hasConnector   example:CompA_C1 , example:CompA_C2 ;
        rdfs:label "Compressor A" ;
        ui:hasSvg              "PP007A" .

example:CompA_C1
        ui:hasConnectorSuffix  "1" .

example:CompA_C2
        ui:hasConnectorSuffix  "2" .


example:CompB
        ui:hasConnector   example:CompB_C1 , example:CompB_C2 ;
        rdfs:label "Compressor B" ;
        ui:hasSvg              "PP007A" .

example:CompB_C1
        ui:hasConnectorSuffix  "1" ;
        example:connectedTo example:CompA_C2 .

example:CompB_C2
        ui:hasConnectorSuffix  "2" .
        
   
example:Valve1
        ui:hasConnector   example:Valve1_C1 , example:Valve1_C2 ;
        rdfs:label "Valve 1" ;
        ui:hasSvg              "ND0012" .

example:Valve1_C1
        ui:hasConnectorSuffix  "1" ;
        example:connectedTo example:CompB_C2 .

example:Valve1_C2
        ui:hasConnectorSuffix  "2" .
        


example:MrPink
	ui:color "pink";
	rdfs:label "Mr. pink" .

example:MrWhite
	ui:color "white";
	rdfs:label "Mr. white";
	example:connectedTo example:MrPink .

example:connectedTo
        ui:color "pink" .`;
