import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	css: {
		modules: {
			localsConvention: 'camelCase',
		},
	},
	resolve: {
		alias: {
			'@rdf-graph': path.resolve(__dirname, '../lib/core'),
			'@rdf-graph-go': path.resolve(__dirname, '../lib/go'),
		},
	},
});