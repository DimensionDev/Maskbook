import { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import type { MaskEvents } from './Events.js'
import { encoder } from '../serializer/index.js'
import type { PluginMessageEmitter } from './CrossIsolationEvents.js'

const m = new WebExtensionMessage<MaskEvents>({ domain: 'mask' })
m.serialization = encoder

export let MaskMessages: { readonly events: PluginMessageEmitter<MaskEvents> } = m

export function __workaround__replaceImplementationOfMaskMessage__(msg: PluginMessageEmitter<any>) {
    MaskMessages = { events: msg }
}
