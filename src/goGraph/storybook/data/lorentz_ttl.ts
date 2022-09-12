export const lorentz_turtle = `@prefix example: <http://example.com#> .
@prefix imf:     <http://example.com/imf#> .
@prefix owl:     <http://www.w3.org/2002/07/owl#> .
@prefix raphael: <https://rdf.equinor.com/raphael-test-only#> .
@prefix rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix ui:      <http://rdf.equinor.com/ui/> .

example:SepA
        ui:hasConnector   example:SepAThreePhaseInput ;
        ui:hasConnector  example:SepALiquidOutput , example:SepAGasOutput ;
        rdfs:label "Sep A" ;
        ui:hasSvg              "Separator_1" .

example:SepAThreePhaseInput
        ui:hasConnectorSuffix  "c1" .

example:SepAGasOutput
        ui:hasConnectorSuffix  "c2" .

example:SepALiquidOutput
        ui:hasConnectorSuffix  "c3" .


example:SepB
        ui:hasConnector   example:SepBThreePhaseInput ;
        ui:hasConnector  example:SepBLiquidOutput , example:SepBGasOutput ;
        rdfs:label "Sep B" ;
        ui:hasSvg              "Separator_1" .

example:SepBThreePhaseInput
        ui:hasConnectorSuffix  "c1" .
		

example:SepBGasOutput
        ui:hasConnectorSuffix  "c2" .

example:SepBLiquidOutput
        ui:hasConnectorSuffix  "c3" ;
        example:connectedTo example:SepAThreePhaseInput .

example:MrPink
	ui:color "pink";
	rdfs:label "Mr. pink" .

example:MrWhite
	ui:color "white";
	rdfs:label "Mr. white";
	example:connectedTo example:MrPink .

example:connectedTo
        ui:color "pink" .`;