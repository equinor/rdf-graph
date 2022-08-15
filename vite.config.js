import { defineConfig } from 'vite';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

export default defineConfig({
	plugins: [
		react({
			// Exclude storybook stories
			//exclude: /\.stories\.(t|j)sx?$/,
			// Only .tsx files
			include: '**/*.tsx',
		}),
	],
	build: {
		lib: {
			entry: path.resolve(__dirname, 'src/index.ts'),
			name: 'rdf-graph',
			formats: ['es', 'umd'],
			fileName: (format) => `rdf-graph.${format}.js`,
		},
		sourcemap: true,
		rollupOptions: {
			external: ['react', 'react-dom'],
			output: {
				globals: {
					react: 'React',
					'react-dom': 'ReactDOM',
				},
			},
			plugins: [peerDepsExternal()],
		},
	},
});
