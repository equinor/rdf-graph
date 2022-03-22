# @equinor/sparql-graph

### Example

```jsx
import { Button } from '@equinor/sparql-graph';

export const DummyPage = (): ReactElement => {
	return (
		<>
			<Button size="s" />
		</>
	);
};
```

### Components

-   [Button](docs/components/Button.md)

### Hooks

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

### Install Yarn

```sh
$ npm install --global yarn
```

### Install project dependencies

```sh
$ yarn
```

## Local development

```sh
$ yarn run storybook # Runs up a local dev version of Storybook - Both good tools to use to quickly see changes along the way.
```

## Code quality

The project is set up with TypeScript, Eslint, Prettier, and the following is run when validating each pull request:

```sh
$ yarn run checkcode
```

## Testing

We will write unit tests on critical functionality.

```sh
$ yarn run test
```

## Construction

```sh
$ yarn run build:storybook # Builds Storybook for static files, and deploys for Vercel for pull requests and merging for main
$ yarn run build:lib # Packs the library (not Storybook) - This step is run before `npm publish` is run
```

</details>
