# rdf-graph

An open source library for visualizing RDF as a graph network.

## Packages

### [@equinor/rdf-graph](/libs/core/)

Core package with only one dependency ([N3.js](https://github.com/rdfjs/N3.js/)).

### [@equinor/rdf-graph-go](/libs/go/)

React UI implementation using [GoJS](https://gojs.net/latest/index.html) (Licensed)

Example use of React component: [RdfGoGraph](/apps/playground/src/components/go/)

Note: The team will focus on the GoJS implementation for further development.

### [@equinor/rdf-graph-cy](/libs/cy/)

React UI implementation using [Cytoscape.js](https://js.cytoscape.org) (Open Source)

Example use of React component: [RdfCyGraph](/apps/playground/src/components/cy/)

### [@equinor/rdf-graph-fg3d](/libs/fg3d/)

Experimental React UI implementation using [3D Force-Directed Graph](https://github.com/vasturiano/3d-force-graph) (Open Source)

Example use of React component: [RdfFg3dGraph](/apps/playground/src/components/fg3d/)

## Playground / Development UI

Spin up the development application for a demonstration of the library and different UI implementations:

```sh
# Clone repo
git clone git@github.com:equinor/rdf-graph.git

# Install pnpm (if not already installed)
# https://pnpm.io/installation

# Install dependencies 
cd rdf-graph && pnpm install

# Open development app
pnpm nx serve playground
# or just (if nx is installed globally on your system or you use an alias: nx="pnpm nx")
nx serve playground
```

## License 🪶

The core of this project is open source, but the [@equinor/rdf-graph-go](https://www.npmjs.com/package/@equinor/rdf-graph-go) package requires a GoJS [software license](https://gojs.net/latest/license.html).

## Developers

See [docs/developers.md](docs/developers.md)
