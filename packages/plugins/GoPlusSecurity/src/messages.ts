import { createPluginMessage, PluginMessageEmitter } from '@masknet/plugin-infra'
import type { ChainId } from '@masknet/web3-shared-evm'
import { PLUGIN_ID } from './constants'

interface Token {
    contract: string
    name: string
    chainId: ChainId
}

type CheckSecurityDialogEvent = { open: boolean }

type tokenRiskWarningDialogEvent = { open: true; token?: Token; swap: boolean } | { open: false }
export interface PluginGoPlusSecurityMessage {
    checkSecurityDialogEvent: CheckSecurityDialogEvent
    tokenRiskWarningDialogEvent: tokenRiskWarningDialogEvent
    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginGoPlusSecurityMessages: PluginMessageEmitter<PluginGoPlusSecurityMessage> =
    createPluginMessage(PLUGIN_ID)
