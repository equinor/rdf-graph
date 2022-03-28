# @equinor/sparql-graph

### Example

```jsx
import { SparqlGraph } from '@equinor/sparql-graph';

export const Page = (): ReactElement => {
	return (
		<>
			<SparqlGraph
				transformations={transformations}
				preferredView={preferredView}
				hasStrictMode={false}
				environment="stid-dev"
				setStatus={setStatus}
				refresh={1}
				layout="Cola"
				query={query}
			/>
		</>
	);
};
```

# Props

**Required props are marked with `*`.**

| Name              | Type                                                | Default    | Description                                |
| ----------------- | --------------------------------------------------- | ---------- | ------------------------------------------ |
| `transformations` | `TransformationsDefinition`                         |            | Graph transformations                      |
| `preferredView`\* | `[key in DataType]: View`                           |            | Visual graph preference                    |
| `hasStrictMode`   | `boolean`                                           | `false`    | Strick mode                                |
| `environment`     | `localhost, dev, stid-dev, test, prod`              | `stid-dev` | Graph environment                          |
| `setStatus`\*     | `React.Dispatch<React.SetStateAction<StatusProps>>` |            | Renders a button with pre-declaration size |
| `refresh`\*       | `number`                                            |            | Graphe refresh state                       |
| `layout`          | `Cola, Cose-Bilkent, Dagre`                         | `Cola`     | Layout name                                |
| `query`\*         | `string`                                            |            | Data                                       |

## Dependabot

### DON'T UPDATT MAJOR VERSION:

-   `@storybook/preset-create-react-app`
-   `react-scripts`
-   `chalk`

## For development at the library

<details>
  <summary>Click to expand!</summary>
  
  ### Install Node.js

Install the latest [LTS] (https://nodejs.org) version of Node.js, and at the same time make sure you are on version 6 of the `npm`-CLI (We currently have some challenges with` npm 7`).

```sh
$ node -v && npm -v
v14.17.6
6.14.15
```

### Log on to the package register

-   Set up a [personal access token](https://github.com/settings/tokens) on your private GitHub account, and turn on SSO for the equinor organization.
-   Register your [email address](https://github.com/settings/emails) on your private GitHub account (no need to replace your default address)

```sh
$ npm login --registry=https://npm.pkg.github.com
> Username: USERNAME
> Password: PERSONAL-ACCESS-TOKEN
> Email: PUBLIC-EMAIL-ADDRESS
```

### Install Npm

```sh
$ npm install --global npm
```

### Install project dependencies

```sh
$ npm
```

## Local development

```sh
$ npm run storybook # Runs up a local dev version of Storybook - Both good tools to use to quickly see changes along the way.
```

## Code quality

The project is set up with TypeScript, Eslint, Prettier, and the following is run when validating each pull request:

```sh
$ npm run checkcode
```

## Testing

We will write unit tests on critical functionality.

```sh
$ npm run test
```

## Construction

```sh
$ npm run build:storybook # Builds Storybook for static files, and deploys for Vercel for pull requests and merging for main
$ npm run build:lib # Packs the library (not Storybook) - This step is run before `npm publish` is run
```

</details>
