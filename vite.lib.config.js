import { defineConfig } from 'vite';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

export default defineConfig({
	plugins: [
		react({
			// Exclude storybook stories
			exclude: /\.stories\.(t|j)sx?$/,
			// Only .tsx files
			include: '**/*.tsx',
		}),
	],
	build: {
		// lib: {
		// 	entry: path.resolve(__dirname, 'src/index.ts'),
		// 	name: 'rdf-graph',
		// 	formats: ['es', 'umd'],
		// 	fileName: (format) => `rdf-graph.${format}.js`,
		// },
		sourcemap: true,
		rollupOptions: {
			input: {
				core: path.resolve(__dirname, 'src/core/index.ts'),
				goGraph: path.resolve(__dirname, 'src/goGraph/index.ts'),
				cyGraph: path.resolve(__dirname, 'src/cyGraph/index.ts'),
				f3dGraph: path.resolve(__dirname, 'src/f3dGraph/index.ts'),
			},
			external: ['react', 'react-dom'],
			output: [
				{
					dir: path.resolve(__dirname, 'dist'),
					format: 'es',
					entryFileNames: '[name].[format].js',
					globals: {
						react: 'React',
					},
				},
				{
					dir: path.resolve(__dirname, 'dist'),
					format: 'cjs',
					entryFileNames: '[name].[format].js',
					globals: {
						react: 'React',
					},
				},
			],
			plugins: [peerDepsExternal()],
		},
	},
});
