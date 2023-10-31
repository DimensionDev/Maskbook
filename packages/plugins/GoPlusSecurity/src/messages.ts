import { getPluginMessage, type PluginMessageEmitter } from '@masknet/plugin-infra'
import type { ChainId } from '@masknet/web3-shared-evm'
import { PLUGIN_ID } from './constants.js'

interface Token {
    contract: string
    name: string
    chainId: ChainId
}

type CheckSecurityDialogEvent = {
    open: boolean
}

export type TokenRiskWarningDialogEvent =
    | {
          open: true
          token?: Token
          swap: boolean
      }
    | {
          open: false
          swap: boolean
      }

export interface PluginGoPlusSecurityMessage {
    checkSecurityDialogEvent: CheckSecurityDialogEvent
    tokenRiskWarningDialogEvent: TokenRiskWarningDialogEvent
    rpc: unknown
}

import.meta.webpackHot?.accept()
export const PluginGoPlusSecurityMessages: PluginMessageEmitter<PluginGoPlusSecurityMessage> =
    getPluginMessage(PLUGIN_ID)
