import 'webpack-target-webextension/lib/background'
import '@dimensiondev/polyfill/web-apis/worker'
import { printEnvironment } from '@dimensiondev/holoflows-kit'
console.log('Hello from Manifest V3', printEnvironment())
export {}
