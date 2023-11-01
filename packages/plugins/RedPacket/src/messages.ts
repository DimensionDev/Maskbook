import { RedPacketPluginID } from './constants.js'
import { getPluginRPC } from '@masknet/plugin-infra'

import.meta.webpackHot?.accept()
export const RedPacketRPC = getPluginRPC<typeof import('./Worker/services.js')>(RedPacketPluginID)
