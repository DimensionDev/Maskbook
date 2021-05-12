import { useAsyncFn } from 'react-use'
import { Messages, Services } from '../../../API'
import { delay } from '@dimensiondev/maskbook-shared'

export function useCreatePersona() {
    return useAsyncFn(async (nickName: string) => {
        const identifier = await Services.Identity.createPersonaByMnemonic(nickName, '')
        delay(300)
        Messages.events.personaChanged.sendToAll([{ of: identifier, owned: true, reason: 'new' }])
    })
}
