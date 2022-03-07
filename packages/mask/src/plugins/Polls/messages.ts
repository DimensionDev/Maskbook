import { PLUGIN_ID } from './constants'
import { createPluginMessage, createPluginRPC } from '@masknet/plugin-infra'
import type { _AsyncVersionOf } from 'async-call-rpc'

const PollMessage = createPluginMessage(PLUGIN_ID)
export const PluginPollRPC: _AsyncVersionOf<typeof import('./Services')> = createPluginRPC(
    PLUGIN_ID,
    () => import('./Services'),
    PollMessage.rpc,
    true,
)
