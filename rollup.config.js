import commonjs from '@rollup/plugin-commonjs';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import typescript from '@rollup/plugin-typescript';
import cleaner from 'rollup-plugin-cleaner';
import json from '@rollup/plugin-json';
import scss from 'rollup-plugin-scss';
import svg from 'rollup-plugin-svg';
import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';

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
		json(),
		scss(),
		commonjs(),
		nodeResolve({ browser: true, preferBuiltins: false }),
		svg(),
		typescript({
			tsconfig: './tsconfig.build.json',
		}),
		cleaner({
			targets: ['./build/'],
		}),
		babel({
			babelHelpers: 'runtime',
			plugins: [
				'@babel/plugin-proposal-export-default-from',
				'@babel/plugin-proposal-export-namespace-from',
				[
					'@babel/plugin-transform-runtime',
					{
						helpers: true,
						regenerator: true,
						useESModules: true,
					},
				],
			],
			presets: [
				[
					'@babel/preset-env',
					{
						targets: {
							esmodules: true,
						},
					},
				],
				['@babel/preset-flow'],
			],
		}),
	],
};
