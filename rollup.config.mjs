// import esbuild from 'rollup-plugin-esbuild';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'output',
    format: 'esm',
  },
  plugins: [
    // esbuild({
    //   platform: 'node',
    //   minify: true,
    //   // optimizeDeps: {
    //   //   include: ['inquirer', 'inquirer-autocomplete-prompt'],
    //   // },
    // }),
    typescript(),
    nodeResolve({ exportConditions: ['node'] }),
    commonjs(),
    json(),
    terser(),
  ],
};
