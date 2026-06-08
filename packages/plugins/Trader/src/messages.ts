import { getPluginMessage, getPluginRPC, type PluginMessageEmitter } from '@masknet/plugin-infra'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { SocialIdentity } from '@masknet/shared-base'
import { PLUGIN_ID } from './constants/index.js'
import type { TagType } from './types/index.js'

interface TrendingAnchorEvent {
    name: string
    type?: TagType
    anchorBounding: DOMRect
    anchorEl: HTMLElement | null
    address?: string
    identity?: SocialIdentity
    currentResult?: Web3Helper.TokenResultAll
}

export interface TraderMessage {
    /**
     * TODO Get rid of this, just put popper alongside the triggers, the tags.
     * View a cash tag
     */
    trendingAnchorObserved: TrendingAnchorEvent

    rpc: unknown
}

import.meta.webpackHot?.accept()
export const PluginTraderMessages: PluginMessageEmitter<TraderMessage> = getPluginMessage(PLUGIN_ID)
export const PluginTraderRPC = getPluginRPC<typeof import('./apis/index.js')>(PLUGIN_ID)
