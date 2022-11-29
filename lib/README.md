# @equinor/rdf-graph

An open source library for visualizing RDF as a graph network.

➡ Insert illustration here! (Turtle to image of nodes with connectors and edges)

## UI frameworks

The following UI implementations (React components) are shipped with the library:

- RdfGoGraph - [GoJS](https://gojs.net/latest/index.html) (Licensed)
- RdfCyGraph - [Cytoscape.js](https://js.cytoscape.org) (Open Source)
- Rdf3dGraph - [3D Force-Directed Graph](https://github.com/vasturiano/3d-force-graph) (Open Source) - Experimental

> Note: The team will focus on the GoJS implementation for further development.

## Examples

```sh
npm i @equinor/rdf-graph
```

Please refer to the Storybook stories for the respective UI implementations:

- [RdfGoGraph - /src/goGraph/storybook/StoryWrapper.tsx](/src/goGraph/storybook/StoryWrapper.tsx)
- [RdfCyGraph - /src/cyGraph/storybook/StoryWrapper.tsx](/src/cyGraph/storybook/StoryWrapper.tsx)
- [Rdf3dGraph - /src/f3dGraph/storybook/StoryWrapper.tsx](/src/f3dGraph/storybook/StoryWrapper.tsx)

## Custom UI implementation

```tsx
export const MyCustomUiComponent: FC<GraphProps> = (props) => {
 const patchHandlerRef = useRef<IUiPatchHandler>(myPatchHandler);

 useEffect(() => {
  applyPatch(props.graphPatch, patchHandlerRef.current);
 }, [props.graphPatch]);
};

export const MyCustomUi = createRdfGraphHoc(MyCustomUiComponent);
```

## License 🪶

The core of this project is open source, but it also ships with an UI implementation using [GoJS](https://gojs.net/latest/index.html), which will require a GoJS [software license](https://gojs.net/latest/license.html) if used.

## Developers

See [docs/developers.md](docs/developers.md)
