import type { MaskEvents } from '@masknet/shared-base'
import type { WebExtensionMessage } from '@dimensiondev/holoflows-kit'

export let MaskMessages: WebExtensionMessage<MaskEvents> = null!

export function setMessages(MaskMessage: any) {
    MaskMessages = MaskMessage
    Object.assign(globalThis, { Messages: MaskMessage })
}
