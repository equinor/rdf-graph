# @equinor/rdf-graph

An open source library for visualizing RDF as a graph network.

➡ Insert illustration here! (Turtle to image of nodes with connectors and edges)

## UI frameworks

The following UI implementations (React components) are shipped with the library:

-   RdfGoGraph - [GoJS](https://gojs.net/latest/index.html) (Licensed)
-   RdfCyGraph - [Cytoscape.js](https://js.cytoscape.org) (Open Source)
-   Rdf3dGraph - [3D Force-Directed Graph](https://github.com/vasturiano/3d-force-graph) (Open Source) - Experimental

> Note: The team will focus on the GoJS implementation for further development.

## Examples

Please refer to the Storybook stories for the respective UI implementations:

-   [RdfGoGraph - /src/goGraph/storybook/StoryWrapper.tsx](/src/goGraph/storybook/StoryWrapper.tsx)
-   [RdfCyGraph - /src/cyGraph/storybook/StoryWrapper.tsx](/src/cyGraph/storybook/StoryWrapper.tsx)
-   [Rdf3dGraph - /src/f3dGraph/storybook/StoryWrapper.tsx](/src/f3dGraph/storybook/StoryWrapper.tsx)

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

## For developers 🥷

### Dependabot 🩺

Don't update major version for the following:

-   @storybook/preset-create-react-app
-   react-scripts
-   chalk

### PR's & releases version 🦆

Consistent title names help maintainers organize their projects better 📚

Prefixes:

-   `patch: patch,fixes,fix,chore,Bump`
-   `minor: feat`
-   `major: major`

Examples: `chore: Update README.md`, `fix: Colors for head`

### Setup of development environment

Install the latest [LTS] (<https://nodejs.org>) version of Node.js, and at the same time make sure you are on version 8 of the `npm`-CLI.

```sh
$ node -v && npm -v
v16.14.0
8.31.0
```

#### Install Npm

```sh
npm install --global npm
```

#### Install project dependencies

```sh
npm i
```

#### Run

```sh
npm run storybook

# Run a local dev version of Storybook - Both good tools to use to quickly see changes along the way.
npm run dev
```

### Code quality

The project is set up with TypeScript, Eslint, Prettier, and the following is run when validating each pull request:

```sh
npm run checkcode
```

### Testing

We write unit tests on critical functionality. Test files should suffixed by `*.test.tsx`.

```sh
npm run test
```

### Construction

```sh
 # Build Storybook static files, and deploy for Vercel for pull requests and merging for main
npm run build:storybook

# Build library (excluding Storybook) - This step is ran before `npm publish`
npm run build:lib
```
