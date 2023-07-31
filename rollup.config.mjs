import terser from '@rollup/plugin-terser'
// plugin-node-resolve and plugin-commonjs are required for a rollup bundled project
// to resolve dependencies from node_modules. See the documentation for these plugins
// for more details.
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'

export default {
  strictDeprecations: true,
  input: 'src/workers/entrypoint.ts',
  output: {
    exports: 'named',
    format: 'es',
    file: 'dist/workers/entrypoint.mjs',
    sourcemap: true,
  },
  plugins: [typescript(), commonjs(), nodeResolve({ browser: true }), terser()],
}
