import type { TagType } from '../Trader/types'
import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'
import { LBP_PluginID } from './constants'

interface PluginLBP_Message {
    /**
     * View a LBP tag
     */
    tagObserved: {
        name: string
        type: TagType
        element: HTMLAnchorElement | null
    }

    rpc: unknown
}

if (module.hot) module.hot.accept()
export const PluginLBP_Messages = createPluginMessage<PluginLBP_Message>(LBP_PluginID)
export const PluginLBP_RPC = createPluginRPC(LBP_PluginID, () => import('./services'), PluginLBP_Messages.events.rpc)
