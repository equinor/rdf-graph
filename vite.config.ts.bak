/// <reference types="vitest" />

import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
	plugins: [react()],
	root: './dev',
	css: {
		modules: {
			localsConvention: 'camelCase',
		},
	},
	test: {
		root: '.', //'./src',
		globals: true,
		environment: 'jsdom',
	},
	resolve: {
		alias: {
			'@rdf-graph': path.resolve(__dirname, './src/main'),
		},
	},
});
