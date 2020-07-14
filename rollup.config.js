import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import { terser } from "rollup-plugin-terser";
import postcss from 'rollup-plugin-postcss';
import sourcemaps from 'rollup-plugin-sourcemaps';
import replace from '@rollup/plugin-replace';
import pkg from './package.json';

export default [
	// browser-friendly UMD build
	{
		input: 'dist/plugins/colorpalette/plugin.es.js',
		output: {
			name: 'kartra_ckeditor_colorpicker',
			file: 'dist/plugins/colorpalette/plugin.js',
			format: 'iife',
			sourcemap: true,
			globals: {
				jquery: "jQuery",
			},
		},
		external: ['jquery'],
		plugins: [
			resolve(), // so Rollup can find `ms`
			commonjs(), // so Rollup can convert `ms` to an ES module
			babel({
				exclude: ['node_modules/**']
            }),
			// postcss({
			// 	extract: true
			// }),
			replace({ 
				'process.env.NODE_ENV': "'production'",
			}),
			sourcemaps(),
            terser(),
		]
	}
];