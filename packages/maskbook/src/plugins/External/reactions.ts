import { makeTypedMessageText } from '../../protocols/typed-message'
import { editActivatedPostMetadata } from '../../protocols/typed-message/global-state'
import { MaskMessage, startEffect } from '../../utils'
import { isLocalContext } from './popup-context'

startEffect(module.hot, () =>
    MaskMessage.events.thirdPartyPing.on((data) => {
        if (!isLocalContext(data.context)) return
        MaskMessage.events.thirdPartyPong.sendToContentScripts(data.challenge)
    }),
)

startEffect(module.hot, () =>
    MaskMessage.events.thirdPartySetPayload.on((data) => {
        if (!isLocalContext(data.context)) return
        editActivatedPostMetadata((meta) => {
            for (const [key, value] of Object.entries(data.payload)) {
                meta.set(key, value)
            }
        })
        MaskMessage.events.compositionUpdated.sendToLocal({
            open: true,
            reason: 'popup',
            content: makeTypedMessageText(data.appendText),
        })
    }),
)
