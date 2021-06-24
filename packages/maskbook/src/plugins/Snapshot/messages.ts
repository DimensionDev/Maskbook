import type { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'
import { SNAPSHOT_PLUGIN_ID } from './constants'

type VoteConfirmDialogEvent =
    | {
          open: true
          choice: number
          choiceText: string
      }
    | {
          open: false
      }

interface SnapshotMessages {
    rpc: unknown
    voteConfirmDialogUpdated: VoteConfirmDialogEvent
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const PluginSnapshotMessages: WebExtensionMessage<SnapshotMessages> =
    createPluginMessage<SnapshotMessages>(SNAPSHOT_PLUGIN_ID)
export const PluginSnapshotRPC = createPluginRPC(
    SNAPSHOT_PLUGIN_ID,
    () => import('./Worker/services'),
    PluginSnapshotMessages.events.rpc,
)
