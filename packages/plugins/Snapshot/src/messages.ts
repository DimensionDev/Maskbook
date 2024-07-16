import { getPluginRPC } from '@masknet/plugin-infra'
import { SNAPSHOT_PLUGIN_ID } from './constants.js'

import.meta.webpackHot?.accept()
export const PluginSnapshotRPC = getPluginRPC<typeof import('./Worker/apis.js')>(SNAPSHOT_PLUGIN_ID)
