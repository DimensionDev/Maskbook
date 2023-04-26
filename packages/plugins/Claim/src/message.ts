import { type PluginMessageEmitter, createPluginMessage } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants.js'

export interface PluginClaimMessage {
    claimDialogEvent: { open: boolean }
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginClaimMessage: PluginMessageEmitter<PluginClaimMessage> = createPluginMessage(PLUGIN_ID)
