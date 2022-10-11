import { build } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const libraries = [
	{
		entry: path.resolve(__dirname, './src/core/index.ts'),
		name: 'core',
	},
	{
		entry: path.resolve(__dirname, './src/goGraph/index.ts'),
		name: 'goGraph',
	},
	{
		entry: path.resolve(__dirname, './src/cyGraph/index.ts'),
		name: 'cyGraph',
	},
	{
		entry: path.resolve(__dirname, './src/f3dGraph/index.ts'),
		name: 'f3dGraph',
	},
];

libraries.forEach(async (lib) => {
	// Build files using Vite
	await build({
		configFile: false,
		build: {
			outDir: './dist',
			lib: {
				...lib,
				formats: ['es', 'umd'],
			},
			rollupOptions: {
				plugins: [peerDepsExternal()],
				//external: ['react', 'react-dom', 'gojs'],
				output: {
					globals: {
						react: 'React',
					},
					entryFileNames: () => `[format]/${lib.name}.[format].js`,
				},
			},
			sourcemap: true,
			emptyOutDir: false,
		},
		plugins: [
			react({
				// Exclude storybook stories
				exclude: /\.stories\.(t|j)sx?$/,
				// Only .tsx files
				include: '**/*.tsx',
			}),
		],
	});
});
