import { useAsyncFn } from 'react-use'
import { Messages, Services } from '../../../API'
import { delay } from '../../../utils'

export function useCreatePersona(callback: () => void) {
    return useAsyncFn(async (nickName?: string) => {
        const identifier = await Services.Identity.createPersonaByMnemonic(nickName, '')
        await Services.Identity.createPersona(identifier)
        delay(300)
        Messages.events.personaChanged.sendToAll([{ of: identifier, owned: true, reason: 'new' }])
        callback()
    })
}
