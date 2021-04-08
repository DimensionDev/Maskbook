import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'
import { SNAPSHOT_PLUGIN_ID } from './constants'

type VoteConfirmDialogEvent =
    | {
          open: true
      }
    | {
          open: false
      }

interface SnapshotMessages {
    rpc: unknown
    voteConfirmDialogUpdated: VoteConfirmDialogEvent
}

export const PluginSnapshotMessages = createPluginMessage<SnapshotMessages>(SNAPSHOT_PLUGIN_ID)
export const PluginSnapshotRPC = createPluginRPC(
    SNAPSHOT_PLUGIN_ID,
    () => import('./services'),
    PluginSnapshotMessages.events.rpc,
)
