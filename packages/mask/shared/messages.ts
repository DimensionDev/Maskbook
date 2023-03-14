import { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import { serializer, type MaskEvents } from '@masknet/shared-base'

export const MaskMessages = new WebExtensionMessage<MaskEvents>({ domain: 'mask' })
MaskMessages.serialization = serializer

Object.assign(globalThis, { MaskMessages })

setTimeout(() => {
    throw new Error('Sentry test')
})
