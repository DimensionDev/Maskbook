import { createPluginMessage, createPluginRPC } from '@masknet/plugin-infra'
import { SNAPSHOT_PLUGIN_ID } from './constants.js'

if (import.meta.webpackHot) import.meta.webpackHot.accept()
const PluginSnapshotMessages = createPluginMessage(SNAPSHOT_PLUGIN_ID)
export const PluginSnapshotRPC = createPluginRPC(
    SNAPSHOT_PLUGIN_ID,
    () => import('./Worker/services.js'),
    PluginSnapshotMessages.rpc,
)
