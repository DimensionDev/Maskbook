// DO NOT add ANY new exports that uses React here.
export * from './types.js'
export {
    createPluginMessage,
    __workaround__replaceImplementationOfCreatePluginMessage__,
    type DefaultPluginMessage,
    type PluginMessageEmitter,
    type PluginMessageEmitterItem,
} from './utils/message.js'
export { createPluginRPC, createPluginRPCGenerator, __workaround__replaceIsBackground__ } from './utils/rpc.js'
export { getAvailablePlugins } from './utils/getAvailablePlugins.js'
export {
    getPluginDefine,
    getRegisteredWeb3Chains,
    getRegisteredWeb3Networks,
    getRegisteredWeb3Providers,
    registerPlugin,
    registeredPlugins,
} from './manager/store.js'
