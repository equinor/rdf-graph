import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import typescript from '@rollup/plugin-typescript';
import cleaner from 'rollup-plugin-cleaner';
import sass from 'rollup-plugin-sass';
import svg from 'rollup-plugin-svg';
import ignore from 'rollup-plugin-ignore';
import { terser } from 'rollup-plugin-terser';
import sizes from 'rollup-plugin-sizes';

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
		ignore(['@equinor/hylar']),
		peerDepsExternal(),
		terser(),
		sizes(),
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
