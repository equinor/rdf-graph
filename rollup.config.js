// import commonjs from '@rollup/plugin-commonjs';
// import peerDepsExternal from 'rollup-plugin-peer-deps-external';
// import typescript from '@rollup/plugin-typescript';
// import cleaner from 'rollup-plugin-cleaner';
// import json from '@rollup/plugin-json';
// import scss from 'rollup-plugin-scss';
// import svg from 'rollup-plugin-svg';
// import babel from '@rollup/plugin-babel';
// import { nodeResolve } from '@rollup/plugin-node-resolve';

// import packageJson from './package.json';

// export default {
// 	input: './src/index.ts',
// 	output: [
// 		{
// 			file: packageJson.main,
// 			format: 'cjs',
// 			sourcemap: true,
// 		},
// 		{
// 			file: packageJson.module,
// 			format: 'esm',
// 			sourcemap: true,
// 		},
// 	],
// 	plugins: [
// 		peerDepsExternal(),
// 		json(),
// 		scss(),
// 		commonjs(),
// 		nodeResolve({
// 			browser: true,
// 			preferBuiltins: false
// 		}),
// 		svg(),
// 		typescript({
// 			tsconfig: './tsconfig.build.json',
// 		}),
// 		cleaner({
// 			targets: ['./build/'],
// 		}),
// 		babel({
// 			babelHelpers: 'bundled',
// 			// plugins: [
// 			// 	'@babel/plugin-proposal-export-default-from',
// 			// 	'@babel/plugin-proposal-export-namespace-from',
// 			// 	[
// 			// 		'@babel/plugin-transform-runtime',
// 			// 		{
// 			// 			helpers: true,
// 			// 			regenerator: true,
// 			// 			useESModules: true,
// 			// 		},
// 			// 	],
// 			// ],
// 			extensions: ['.js', '.jsx', '.es6', '.es', '.mjs', '.tsx', '.ts'],
// 			parserOpts: {
// 				plugins: ["jsx", "flow", 'typescript', 'doExpressions']
// 			},
// 			presets: [
// 				[
// 					'@babel/preset-env',
// 					{
// 						useBuiltIns: 'usage',
// 					}
// 				],
// 				['@babel/preset-flow'],
// 				['@babel/preset-react',
// 					{
// 						"pragma": "dom", // default pragma is React.createElement (only in classic runtime)
// 						"pragmaFrag": "DomFrag", // default is React.Fragment (only in classic runtime)
// 						"throwIfNamespace": false, // defaults to true
// 						"runtime": "classic" // defaults to classic
// 						// "importSource": "custom-jsx-library" // defaults to react (only in automatic runtime)
// 					}
// 				],
// 				['@babel/preset-typescript',
// 					{
// 						isTSX: true,
// 						allExtensions: true,
// 						allowDeclareFields: true,
// 					}
// 				],
// 			],
// 		}),
// 	],
// };
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import typescript from '@rollup/plugin-typescript';
import cleaner from 'rollup-plugin-cleaner';
import sass from 'rollup-plugin-sass';
import svg from 'rollup-plugin-svg';

import packageJson from './package.json';

export default {
	input: './src/index.ts',
	output: [
		{
			file: packageJson.main,
			format: 'cjs',
			sourcemap: true,
		},
		{
			file: packageJson.module,
			format: 'esm',
			sourcemap: true,
		},
	],
	plugins: [
		peerDepsExternal(),
		nodeResolve({
			browser: true,
			preferBuiltins: false,
		}),
		sass({
			insert: true,
		}),
		svg(),
		commonjs(),
		typescript({
			tsconfig: './tsconfig.build.json',
		}),
		cleaner({
			targets: ['./build/'],
		}),
	],
};
