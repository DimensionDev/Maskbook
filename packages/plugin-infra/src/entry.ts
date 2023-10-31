// DO NOT add ANY new exports that uses React here.
export * from './types.js'
export {
    getPluginMessage,
    __workaround__replaceImplementationOfCreatePluginMessage__,
    type PluginMessageEmitter,
    type PluginMessageEmitterItem,
} from './utils/message.js'
export { getPluginRPC, getPluginRPCGenerator, __workaround__replaceIsBackground__ } from './utils/rpc.js'
export { getAvailablePlugins } from './utils/getAvailablePlugins.js'
export { getPluginDefine, registerPlugin, registeredPlugins } from './manager/store.js'
