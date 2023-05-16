import { type PluginMessageEmitter, createPluginMessage } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants.js'

export interface PluginClaimMessage {
    claimDialogEvent: { open: boolean }
    claimSuccessDialogEvent: {
        open: boolean
        token?: string
        amount?: string
    }
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginClaimMessage: PluginMessageEmitter<PluginClaimMessage> = createPluginMessage(PLUGIN_ID)
