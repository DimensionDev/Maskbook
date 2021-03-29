import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'
import { SNAPSHOT_PLUGIN_ID } from './constants'

interface SnapshotMessages {
    rpc: unknown
}

export const PluginSnapshotMessages = createPluginMessage<SnapshotMessages>(SNAPSHOT_PLUGIN_ID)
export const PluginGitcoinRPC = createPluginRPC(
    SNAPSHOT_PLUGIN_ID,
    () => import('./services'),
    PluginSnapshotMessages.events.rpc,
)
