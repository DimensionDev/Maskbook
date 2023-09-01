import type { MaskEvents } from '@masknet/shared-base'
import type { WebExtensionMessage } from '@dimensiondev/holoflows-kit'

export let Messages: WebExtensionMessage<MaskEvents> = null!

export function setMessages(MaskMessage: any) {
    Messages = MaskMessage
    Object.assign(globalThis, { Messages: MaskMessage })
}
