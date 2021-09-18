import { createPluginMessage, PluginMessageEmitter, createPluginRPC } from '@masknet/plugin-infra'
import { BARNBRIDGE_PLUGIN_ID } from './constants'

type BBDialog = {
    open: true
    title: string
    address: string
}

interface BBMessages {
    DepositDialogUpdated: BBDialog

    rpc: unknown
}

import.meta.webpackHot && import.meta.webpackHot.accept()

export const PluginBarnBridgeMessages: PluginMessageEmitter<BBMessages> = createPluginMessage(BARNBRIDGE_PLUGIN_ID)
export const PluginBarnBridgeRPC = createPluginRPC(
    BARNBRIDGE_PLUGIN_ID,
    () => import('./services'),
    PluginBarnBridgeMessages.rpc,
)
