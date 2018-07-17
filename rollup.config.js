import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import pkg from './package.json';

const dependencies = Object.keys(require('./package').dependencies)
const devDependencies = Object.keys(require('./package').devDependencies)

export default [
    // browser-friendly UMD build
    {
        input: 'src/main.js',
        external: [...dependencies,...devDependencies],
        output: {
            name: pkg.name,
            file: pkg.browser,
            format: 'umd',
            globals: {rxjs: 'rxjs', react: 'react'},
        },
        plugins: [
            babel({exclude: 'node_modules/**'}),
            resolve(), // so Rollup can find `ms`
            commonjs() // so Rollup can convert `ms` to an ES module
        ]
    },
    // CommonJS (for Node) and ES module (for bundlers) build.
    // (We could have three entries in the configuration array
    // instead of two, but it's quicker to generate multiple
    // builds from a single configuration where possible, using
    // an array for the `output` option, where we can specify
    // `file` and `format` for each target)
    {
        input: 'src/main.js',
        external: [...dependencies,...devDependencies],
        output: [
            {file: pkg.main, format: 'cjs'},
            {file: pkg.module, format: 'es'}
        ],
        plugins: [
            babel({exclude: 'node_modules/**'}),
            resolve(), // so Rollup can find `ms`
            commonjs() // so Rollup can convert `ms` to an ES module
        ]
    }
];