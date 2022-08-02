export const esd_turtle = `@prefix UI:   <http://rdf.equinor.com/ui/> .
@prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd:  <http://www.w3.org/2001/XMLSchema#> .

<https://rdf.equinor.com/drafts/aml/TAG-02>
        rdfs:label          "Tag 02" , "Disconnect Essential power sources" ;
        UI:hasConnector     <https://rdf.equinor.com/drafts/aml/TAG-02-C1> , <https://rdf.equinor.com/drafts/aml/TAG-02-C2> ;
        UI:hasNodeTemplate  "BorderConnectorTemplate" .

<https://rdf.equinor.com/drafts/aml/TAG-02-C1>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        UI:hasDirection  "north" .

<https://rdf.equinor.com/drafts/aml/TAG-02-C2>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        UI:hasDirection  "north" .

<https://rdf.equinor.com/drafts/aml/SPLIT-01-C1>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        UI:hasDirection  "south" ;
<https://rdf.equinor.com/drafts/aml/Signals>
                <https://rdf.equinor.com/drafts/aml/TAG-02-C2> .

<https://rdf.equinor.com/drafts/aml/SPLIT-01>
        rdfs:label          "Split 01" ;
        UI:hasConnector     <https://rdf.equinor.com/drafts/aml/SPLIT-01-C1> , <https://rdf.equinor.com/drafts/aml/SPLIT-01-C2> , <https://rdf.equinor.com/drafts/aml/SPLIT-01-C3> ;
        UI:hasNodeTemplate  "Ellipse" ;
        UI:hasSimpleSvg     "https://dugtrioexperimental.blob.core.windows.net/graph-icons/esd-draft/logicsymbols/Splitter-OneToMany.svg" .

<https://rdf.equinor.com/drafts/aml/SPLIT-09-C3>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        UI:hasDirection  "south" ;
        <https://rdf.equinor.com/drafts/aml/Signals>
                <https://rdf.equinor.com/drafts/aml/TAG-02-C1> .

<https://rdf.equinor.com/drafts/aml/SPLIT-09>
        rdfs:label          "Split 09" ;
        UI:hasConnector     <https://rdf.equinor.com/drafts/aml/SPLIT-09-C1> , <https://rdf.equinor.com/drafts/aml/SPLIT-09-C2> , <https://rdf.equinor.com/drafts/aml/SPLIT-09-C3> , <https://rdf.equinor.com/drafts/aml/SPLIT-09-C4> , <https://rdf.equinor.com/drafts/aml/SPLIT-09-C5> , <https://rdf.equinor.com/drafts/aml/SPLIT-09-C6> , <https://rdf.equinor.com/drafts/aml/SPLIT-09-C7> ;
        UI:hasNodeTemplate  "Ellipse" ;
        UI:hasSimpleSvg     "https://dugtrioexperimental.blob.core.windows.net/graph-icons/esd-draft/logicsymbols/Splitter-OneToMany.svg" .

  <https://rdf.equinor.com/drafts/aml/OR-07>
        rdfs:label          "OR 07" ;
        UI:hasConnector     <https://rdf.equinor.com/drafts/aml/OR-07-C1> , <https://rdf.equinor.com/drafts/aml/OR-07-C2> , <https://rdf.equinor.com/drafts/aml/OR-07-C3> ;
        UI:hasNodeTemplate  "Ellipse" ;
        UI:hasSimpleSvg     "https://dugtrioexperimental.blob.core.windows.net/graph-icons/esd-draft/logicsymbols/LogicPort-OR.svg" .

<https://rdf.equinor.com/drafts/aml/OR-07-C3>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        UI:hasDirection  "north" .

<https://rdf.equinor.com/drafts/aml/SPLIT-09-C3>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        UI:hasDirection  "south" ;
        <https://rdf.equinor.com/drafts/aml/Signals>
                <https://rdf.equinor.com/drafts/aml/TAG-02-C1> .

<https://rdf.equinor.com/drafts/aml/TAG-05-C1>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        UI:hasDirection  "north" .

<https://rdf.equinor.com/drafts/aml/SPLIT-09-C2>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        UI:hasDirection  "south" ;
        <https://rdf.equinor.com/drafts/aml/Signals>
                <https://rdf.equinor.com/drafts/aml/OR-07-C2> .

<https://rdf.equinor.com/drafts/aml/SPLIT-04-C2>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        UI:hasDirection  "north" .

<https://rdf.equinor.com/drafts/aml/TAG-05>
        rdfs:label          "Tag 05" , "Topside LP bleed closing all Subsea XT-valves" ;
        UI:hasConnector     <https://rdf.equinor.com/drafts/aml/TAG-05-C1> ;
        UI:hasNodeTemplate  "BorderConnectorTemplate" .

<https://rdf.equinor.com/drafts/aml/ESD-A-C2>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        UI:hasDirection  "south" ;
        <https://rdf.equinor.com/drafts/aml/Signals>
                <https://rdf.equinor.com/drafts/aml/EFFECT-K-C1> .

<https://rdf.equinor.com/drafts/aml/EFFECT-Y-C1>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        rdfs:label      "Effect y connector 1" ;
        UI:hasDirection  "north" .

<https://rdf.equinor.com/drafts/aml/SPLIT-04-C4>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        UI:hasDirection  "south" ;
        <https://rdf.equinor.com/drafts/aml/Signals>
                <https://rdf.equinor.com/drafts/aml/EFFECT-Z-C1> .

<https://rdf.equinor.com/drafts/aml/TAG-02-C1>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        UI:hasDirection  "north" .

<https://rdf.equinor.com/drafts/aml/EFFECT-Z-C1>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        rdfs:label      "Effect y connector 1" ;
        UI:hasDirection  "north" .

<https://rdf.equinor.com/drafts/aml/TAG-02>
        rdfs:label          "Disconnect Essential power sources" , "A-DummyTag0002" ;
        UI:hasConnector     <https://rdf.equinor.com/drafts/aml/TAG-02-C1> , <https://rdf.equinor.com/drafts/aml/TAG-02-C2> ;
        UI:hasNodeTemplate  "BorderConnectorTemplate" .

<https://rdf.equinor.com/drafts/aml/ESD-A-C4>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        UI:hasDirection  "north" .

<https://rdf.equinor.com/drafts/aml/EFFECT-J-C1>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        rdfs:label      "Effect j connector 1" ;
        UI:hasDirection  "north" .

<https://rdf.equinor.com/drafts/aml/SPLIT-09-C6>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        UI:hasDirection  "north" .

<https://rdf.equinor.com/drafts/aml/SPLIT-09-C5>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        UI:hasDirection  "south" ;
        <https://rdf.equinor.com/drafts/aml/Signals>
                <https://rdf.equinor.com/drafts/aml/TIMER-01-C2> .

<https://rdf.equinor.com/drafts/aml/SPLIT-04-C1>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        UI:hasDirection  "south" ;
        <https://rdf.equinor.com/drafts/aml/Signals>
                <https://rdf.equinor.com/drafts/aml/EFFECT-H-C1> .

<https://rdf.equinor.com/drafts/aml/EFFECT-H-C1>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        rdfs:label      "Effect h connector 1" ;
        UI:hasDirection  "north" .

<https://rdf.equinor.com/drafts/aml/EFFECT-I-C1>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        rdfs:label      "Effect i connector 1" ;
        UI:hasDirection  "north" .

<https://rdf.equinor.com/drafts/aml/OR-07-C2>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        UI:hasDirection  "north" .

<https://rdf.equinor.com/drafts/aml/ESD-A-C1>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        UI:hasDirection  "north" .

<https://rdf.equinor.com/drafts/aml/SPLIT-04>
        rdfs:label          "Split 04" ;
        UI:hasConnector     <https://rdf.equinor.com/drafts/aml/SPLIT-04-C1> , <https://rdf.equinor.com/drafts/aml/SPLIT-04-C2> , <https://rdf.equinor.com/drafts/aml/SPLIT-04-C3> , <https://rdf.equinor.com/drafts/aml/SPLIT-04-C4> , <https://rdf.equinor.com/drafts/aml/SPLIT-04-C5> ;
        UI:hasNodeTemplate  "Ellipse" ;
        UI:hasSimpleSvg     "https://dugtrioexperimental.blob.core.windows.net/graph-icons/esd-draft/logicsymbols/Splitter-OneToMany.svg" .

<https://rdf.equinor.com/drafts/aml/SPLIT-09-C4>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        UI:hasDirection  "south" ;
        <https://rdf.equinor.com/drafts/aml/Signals>
                <https://rdf.equinor.com/drafts/aml/TAG-05-C1> .

<https://rdf.equinor.com/drafts/aml/SPLIT-04-C5>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        UI:hasDirection  "south" ;
        <https://rdf.equinor.com/drafts/aml/Signals>
                <https://rdf.equinor.com/drafts/aml/EFFECT-X-C1> .

<https://rdf.equinor.com/drafts/aml/TIMER-01-C2>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        UI:hasDirection  "north" .

<https://rdf.equinor.com/drafts/aml/SPLIT-09>
        rdfs:label          "0000101Split902" ;
        UI:hasConnector     <https://rdf.equinor.com/drafts/aml/SPLIT-09-C1> , <https://rdf.equinor.com/drafts/aml/SPLIT-09-C2> , <https://rdf.equinor.com/drafts/aml/SPLIT-09-C3> , <https://rdf.equinor.com/drafts/aml/SPLIT-09-C4> , <https://rdf.equinor.com/drafts/aml/SPLIT-09-C5> , <https://rdf.equinor.com/drafts/aml/SPLIT-09-C6> , <https://rdf.equinor.com/drafts/aml/SPLIT-09-C7> ;
        UI:hasNodeTemplate  "Ellipse" ;
        UI:hasSimpleSvg     "https://dugtrioexperimental.blob.core.windows.net/graph-icons/esd-draft/logicsymbols/Splitter-OneToMany.svg" .

<https://rdf.equinor.com/drafts/aml/TIMER-01-C1>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        UI:hasDirection  "south" ;
        <https://rdf.equinor.com/drafts/aml/Signals>
                <https://rdf.equinor.com/drafts/aml/EFFECT-L-C1> , <https://rdf.equinor.com/drafts/aml/EFFECT-I-C1> .

<https://rdf.equinor.com/drafts/aml/ESD-A>
        rdfs:label          "ESDA" , "A-ESD" ;
        UI:hasConnector     <https://rdf.equinor.com/drafts/aml/ESD-A-C1> , <https://rdf.equinor.com/drafts/aml/ESD-A-C2> , <https://rdf.equinor.com/drafts/aml/ESD-A-C3> , <https://rdf.equinor.com/drafts/aml/ESD-A-C4> ;
        UI:hasNodeTemplate  "BorderConnectorTemplate" .

<https://rdf.equinor.com/drafts/aml/OR-07-C1>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        UI:hasDirection  "south" ;
        <https://rdf.equinor.com/drafts/aml/Signals>
                <https://rdf.equinor.com/drafts/aml/EFFECT-M-C1> .

<https://rdf.equinor.com/drafts/aml/EFFECT-M-C1>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        rdfs:label      "Effect m connector 1" ;
        UI:hasDirection  "north" .

<https://rdf.equinor.com/drafts/aml/TAG-02-C2>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        UI:hasDirection  "north" .

<https://rdf.equinor.com/drafts/aml/SPLIT-09-C1>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        UI:hasDirection  "south" ;
        <https://rdf.equinor.com/drafts/aml/Signals>
                <https://rdf.equinor.com/drafts/aml/ESD-A-C4> .

<https://rdf.equinor.com/drafts/aml/TIMER-01>
        rdfs:label       "Timer 01" ;
        UI:hasConnector  <https://rdf.equinor.com/drafts/aml/TIMER-01-C1> , <https://rdf.equinor.com/drafts/aml/TIMER-01-C2> .

<https://rdf.equinor.com/drafts/aml/EFFECT-L-C1>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        rdfs:label      "Effect k connector 1" ;
        UI:hasDirection  "north" .

<https://rdf.equinor.com/drafts/aml/EFFECT-K-C1>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        rdfs:label      "Effect k connector 1" ;
        UI:hasDirection  "north" .

<https://rdf.equinor.com/drafts/aml/SPLIT-09-C7>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        UI:hasDirection  "south" ;
        <https://rdf.equinor.com/drafts/aml/Signals>
                <https://rdf.equinor.com/drafts/aml/SPLIT-04-C2> .

<https://rdf.equinor.com/drafts/aml/SPLIT-04-C3>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        UI:hasDirection  "south" ;
        <https://rdf.equinor.com/drafts/aml/Signals>
                <https://rdf.equinor.com/drafts/aml/EFFECT-J-C1> .

<https://rdf.equinor.com/drafts/aml/ESD-A-C3>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        UI:hasDirection  "south" ;
        <https://rdf.equinor.com/drafts/aml/Signals>
                <https://rdf.equinor.com/drafts/aml/EFFECT-Y-C1> .

<https://rdf.equinor.com/drafts/aml/EFFECT-X-C1>
        rdf:type         <https://rdf.equinor.com/drafts/aml/Connector> ;
        rdfs:label      "Effect x connector 1" ;
        UI:hasDirection  "north" .

`;
