import { type PluginMessageEmitter, getPluginMessage } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants.js'

export interface PluginClaimMessage {
    claimDialogEvent: { open: boolean }
    claimSuccessDialogEvent: {
        open: boolean
        token?: string
        amount?: string
    }
}

import.meta.webpackHot?.accept()
export const PluginClaimMessage: PluginMessageEmitter<PluginClaimMessage> = getPluginMessage(PLUGIN_ID)
