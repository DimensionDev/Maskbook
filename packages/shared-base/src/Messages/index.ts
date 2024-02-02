import { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import type { MaskEvents } from './Events.js'
import { serializer } from '../serializer/index.js'
import type { PluginMessageEmitter } from './CrossIsolationEvents.js'

const m = new WebExtensionMessage<MaskEvents>({ domain: 'mask' })
m.serialization = serializer
export const MaskMessages: { readonly events: PluginMessageEmitter<MaskEvents> } = m
