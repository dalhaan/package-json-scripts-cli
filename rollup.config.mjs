import esbuild from 'rollup-plugin-esbuild';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'output',
    format: 'esm',
  },
  plugins: [
    esbuild({
      platform: 'node',
      // optimizeDeps: {
      //   include: ['inquirer', 'inquirer-autocomplete-prompt'],
      // },
    }),
  ],
};
