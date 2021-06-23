import type { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'
import { PLUGIN_ID } from './constants'

export interface AirdropMessages {
    _: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const AirdropMessage: WebExtensionMessage<AirdropMessages> = createPluginMessage<{ _: unknown }>(PLUGIN_ID)
export const AirdropRPC = createPluginRPC(PLUGIN_ID, () => import('./services'), AirdropMessage.events._)
