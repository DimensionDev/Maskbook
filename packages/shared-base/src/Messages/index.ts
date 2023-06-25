import { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import type { MaskEvents } from './Events.js'
import { serializer } from '../serializer/index.js'

export const MaskMessages = new WebExtensionMessage<MaskEvents>({ domain: 'mask' })
MaskMessages.serialization = serializer
