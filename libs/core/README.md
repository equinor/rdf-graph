# @equinor/rdf-graph - Core Library

Core package with only one dependency ([N3.js](https://github.com/rdfjs/N3.js/)).

## Example

```ts
import { RdfGraph, GraphPatch, GraphState, RdfPatch, turtleToQuads } from '@equinor/rdf-graph';

// Create a RdfGraph state object
const state: GraphState = new RdfGraph({ symbolProvider });

// In this example we want to "add" all RDF triples from some turtle
// data to our custom UI
const turtleString = "....";

// Create a set of RdfPatch'es from our RDF data
// An RdfPatch is simply an object containing an action and a N3 Quad:
//
//    RdfPatch
//
//    { 
//      action: "add" | "remove";
//      data: N3.Quad;
//    }
//
const rdfPatches: RdfPatch[] = turtleToQuads(turtleString)
                    .map(q => ({ action: "add", data: q}));

// Get UI graph patches by patching the rdf-graph state with the RdfPatches
const graphPatches: GraphPatch[] = state.patch(rdfPatches);

// Apply the graph patches to your UI state handler
myAwesomeUiImplementation.applyGraphPatches(graphPatches);
```

## Symbol Provider

TODO
