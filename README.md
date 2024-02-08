# rdf-graph

An open source library for visualizing RDF as a graph network.

## Packages

| Package  | Version | Description |
| ------------- | ------------- | ------------- |
| [@equinor/rdf-graph](libs/core/) | [![core version](https://img.shields.io/npm/v/@equinor/rdf-graph)](libs/core/CHANGELOG.md) | Core library |
| [@equinor/rdf-graph-go](libs/go/) | [![go version](https://img.shields.io/npm/v/@equinor/rdf-graph-go)](libs/go/CHANGELOG.md) | GoJS UI Implementation |
| [@equinor/rdf-graph-cy](libs/cy/) | [![cy version](https://img.shields.io/npm/v/@equinor/rdf-graph-cy)](libs/cy/CHANGELOG.md) | Cytoscape.js UI Implementation |
| [@equinor/rdf-graph-fg3d](libs/fg3d/) | [![fg3d version](https://img.shields.io/npm/v/@equinor/rdf-graph-fg3d)](libs/fg3d/CHANGELOG.md) | 3D Force-Directed UI Implementation |

## Releasing a new version
1. Update package number for the relevant `package.json` located in a subfolder of the `libs` folder.
2. Create a PR with the changes.

## Demo

Spin up the development application for a demonstration of the library and different UI implementations/packages:

```sh
# Clone repo
git clone git@github.com:equinor/rdf-graph.git

# Install pnpm (if not already installed)
# https://pnpm.io/installation

# Install dependencies 
cd rdf-graph && pnpm install

# Open development app
pnpm nx serve playground
```

## Contribute

See our [contributing guide](CONTRIBUTING.md).

## License

The core of this project is open source, but the [@equinor/rdf-graph-go](https://www.npmjs.com/package/@equinor/rdf-graph-go) package requires a GoJS [software license](https://gojs.net/latest/license.html).

