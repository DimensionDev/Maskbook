import commonjs from '@rollup/plugin-commonjs'
import node from '@rollup/plugin-node-resolve'
import sucrase from '@rollup/plugin-sucrase'
import json from '@rollup/plugin-json'
import alias from '@rollup/plugin-alias'
import dts from 'rollup-plugin-dts'

const config = {
  input: './src/index.ts',
  output: {
    file: 'dist/output.js',
    format: 'cjs',
  },
  plugins: [
    commonjs(),
    node(),
    json(),
    alias({
      entries: [
        { find: '@masknet/web3-shared-evm', replacement: '../web3-shared/evm/index.ts' },
        { find: '@masknet/web3-shared-base', replacement: '../web3-shared/base/index.ts' },
      ],
    }),
    sucrase({ transforms: ['typescript', 'jsx'] }),
  ],
  external: (id) => {
    if (id.startsWith('.')) return false
    if (id.includes('@masknet')) return false
    if (id.includes('node_modules')) return true
    return false
  },
  treeshake: { moduleSideEffects: false, propertyReadSideEffects: false },
}

const dtsConfig = {
  input: './dist/index.d.ts',
  output: [{ file: './dist/output.d.ts', format: 'es' }],
  plugins: [
    dts({
      respectExternal: true,
    }),
  ],
  external: config.external,
}

export default [config, dtsConfig]
