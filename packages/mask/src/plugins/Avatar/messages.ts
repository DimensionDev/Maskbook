import { PLUGIN_ID } from './constants'
import { createPluginRPC } from '@masknet/plugin-infra'
import { createPluginMessage } from '@masknet/plugin-infra'

if (import.meta.webpackHot) import.meta.webpackHot.accept()
const NFTAvatarMessage = createPluginMessage(PLUGIN_ID)
export const PluginNFTAvatarRPC = createPluginRPC(PLUGIN_ID, () => import('./Services'), NFTAvatarMessage.rpc)
