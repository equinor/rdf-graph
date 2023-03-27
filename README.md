# @equinor/rdf-graph

An open source library for visualizing RDF as a graph network.

## UI frameworks

The following UI implementations (React components) are shipped with the library:

- RdfGoGraph - [GoJS](https://gojs.net/latest/index.html) (Licensed)
- RdfCyGraph - [Cytoscape.js](https://js.cytoscape.org) (Open Source)
- Rdf3dGraph - [3D Force-Directed Graph](https://github.com/vasturiano/3d-force-graph) (Open Source) - Experimental

> Note: The team will focus on the GoJS implementation for further development.

## Examples in Development UI

Spin up the development application for a demonstration of the library and different UI implementations:

```sh
// Clone repo
git clone git@github.com:equinor/rdf-graph.git

// Install 
cd rdf-graph && pnpm install

// Open development app
nx serve playground
# or
pnpm nx serve playground
```

Please refer to the development application for the respective UI implementations:

- [RdfGoGraph](/apps/playground/src/components/go/)
- [RdfCyGraph](/apps/playground/src/components/cy/)
- [Rdf3dGraph](/apps/playground/src/components/f3d/)

## License 🪶

The core of this project is open source, but it also ships with an UI implementation using [GoJS](https://gojs.net/latest/index.html), which will require a GoJS [software license](https://gojs.net/latest/license.html) if used.

## Developers

See [docs/developers.md](docs/developers.md)