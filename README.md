# @equinor/rdf-graph

# Example 🪴

```tsx
const dummyNode = 'NewNode';
const colors = ['blue', 'green', 'red', 'yellow', 'purple', 'pink', 'cyan', 'grey'];

const [selection, setSelection] = useState<RdfSelection>(new RdfSelection([], []));

const [patches, setPatches] = useState<Array<RdfPatch>>([]);

const deleteSelection = () => {
	const newPatch = new RdfPatch({ tripleRemovals: selection.rdfTriple, individualRemovals: selection.individuals });
	let newPatches = [...patches, newPatch];
	setPatches(newPatches);
};

const onElementsSelected = (selection: RdfSelection): void => {
	setSelection(selection);
	if (selection.individuals.length > 0) {
		const selectedNode = selection.individuals[0].iri;
		let newPatch: RdfPatch;
		if (selectedNode === dummyNode) {
			const randomColor = colors[Math.floor(Math.random() * colors.length)];
			newPatch = new RdfPatch({ tripleAdditions: [new RdfTriple(selectedNode, 'http://rdf.equinor.com/ui/color', randomColor)] });
		} else {
			newPatch = new RdfPatch({
				tripleAdditions: [
					new RdfTriple(selectedNode, 'NewPredicate', 'NewNode'),
					new RdfTriple('NewNode', 'http://www.w3.org/2000/01/rdf-schema#label', 'New cool node. Tap for random color'),
				],
			});
		}
		let newPatches = [...patches, newPatch];
		setPatches(newPatches);
	}
};

return (
	<div>
		<Button onClick={deleteSelection}> Delete selection </Button>
		<SparqlGraph turtleString={turtleString} layoutName={layoutName} patches={patches} onElementsSelected={onElementsSelected} />
	</div>
);
```

# Props 📦

| Name               | Type                                | Description                                 |
| ------------------ | ----------------------------------- | ------------------------------------------- |
| `turtleString`     | `string`                            | Data                                        |
| `layout`           | `Cola, Cose-Bilkent, Dagre`         | Layout name                                 |
| `onElementChanged` | `(selection: RdfSelection) => void` | Callback when user (de)selects elements     |
| `patches`          | `RdfPatch[]`                        | List of changes to facilitate interactivity |

## Gojs dependency 🪚

If using gojs dependency this must be installed seperatly using `npm install gojs` and `npm install gojs-react`. Clients will be responsable for choosing appropiate license.

## Dependabot 🩺

### DON'T UPDATT MAJOR VERSION:

-   `@storybook/preset-create-react-app`
-   `react-scripts`
-   `chalk`

## PR's & releases version 🦆

Consistent title names help maintainers organise their projects better 📚

`Prefixes:`

-   `patch: patch,fixes,fix,chore,Bump`
-   `minor: feat`
-   `major: major`

Example: `chore: Update README.md`, | `fix: Colors for head`

## For development at the library 🥷

<details>
  <summary>Click to expand!</summary>
  
  ### Install Node.js

Install the latest [LTS] (https://nodejs.org) version of Node.js, and at the same time make sure you are on version 6 of the `npm`-CLI.

```sh
$ node -v && npm -v
v16.14.0
8.31.0
```

### Install Npm

```sh
$ npm install --global npm
```

### Install project dependencies

```sh
$ npm i
```

## Local development

```sh
$ npm run storybook
$ npm run dev # Runs up a local dev version of Storybook - Both good tools to use to quickly see changes along the way.
```

## Code quality

The project is set up with TypeScript, Eslint, Prettier, and the following is run when validating each pull request:

```sh
$ npm run checkcode
```

## Testing

We will write unit tests on critical functionality. Tests should be grouped under `src/tests/` and named after test file they are testing suffixed by test.tsx

```sh
$ npm run test
```

## Construction

```sh
$ npm run build:storybook # Builds Storybook for static files, and deploys for Vercel for pull requests and merging for main
$ npm run build:lib # Packs the library (not Storybook) - This step is run before `npm publish` is run
```

</details>
