// use `mergeConfig` to recursively merge Vite options
const { mergeConfig } = require('vite');

module.exports = {
	core: { builder: '@storybook/builder-vite' },
	staticDirs: ['../storybook-public'],
	stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
	addons: ['@storybook/addon-links', '@storybook/addon-essentials', 'storybook-addon-theme-playground'],
};
