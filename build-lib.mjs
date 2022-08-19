import { build } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

// import * as fsAsync from 'fs/promises';
// import * as fs from 'fs';

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
				external: ['react', 'react-dom'],
				output: {
					globals: {
						react: 'React',
					},
					//assetFileNames: `${lib.name}/[name].[ext]`,
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

	// Create declaration file for library

	// const typesDir = path.resolve(__dirname, `./dist/types`);

	// if (!fs.existsSync(typesDir)) {
	// 	fs.mkdirSync(typesDir);
	// }

	// let content = `export * from './${lib.name}';`;

	// // The core file must reference the other modules because the "types" field in package.json
	// // only accepts a single file ref
	// if (lib.name === 'core') {
	// 	content = '\n' + content;
	// 	libraries
	// 		.filter((l) => l.name !== 'core')
	// 		.map((b) => b.name)
	// 		.forEach((str) => {
	// 			content = `/// <reference path="./${str}.d.ts" />\n` + content;
	// 		});
	// }

	// try {
	// 	const fileName = path.resolve(__dirname, `./dist/types/${lib.name}.d.ts`);
	// 	await fsAsync.writeFile(fileName, content);
	// } catch (err) {
	// 	console.log(err);
	// }
});
