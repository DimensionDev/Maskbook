import { createPluginMessage } from '@masknet/plugin-infra'
import { createPluginRPC } from '../utils/createPluginRPC'
import { SNAPSHOT_PLUGIN_ID } from './constants'

if (import.meta.webpackHot) import.meta.webpackHot.accept()
const PluginSnapshotMessages = createPluginMessage(SNAPSHOT_PLUGIN_ID)
export const PluginSnapshotRPC = createPluginRPC(
    SNAPSHOT_PLUGIN_ID,
    () => import('./Worker/services'),
    PluginSnapshotMessages.rpc,
)
