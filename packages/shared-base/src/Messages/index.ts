import { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import type { MaskEvents } from './Events.js'
import { serializer } from '../serializer/index.js'
import type { PluginMessageEmitter } from './CrossIsolationEvents.js'

export let MaskMessages: { readonly events: PluginMessageEmitter<MaskEvents> }
const m = new WebExtensionMessage<MaskEvents>({ domain: 'mask' })
m.serialization = serializer
MaskMessages = m

export function __workaround__replaceImplementationOfMaskMessage__(msg: PluginMessageEmitter<any>) {
    MaskMessages = { events: msg }
}
