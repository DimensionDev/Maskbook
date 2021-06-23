import { useAsyncFn } from 'react-use'
import { Messages, Services } from '../../../API'
import { delay } from '@masknet/shared'

export function useCreatePersona() {
    return useAsyncFn(async (nickName: string) => {
        // TODO: should second parameter be the password?
        const identifier = await Services.Identity.createPersonaByMnemonic(nickName, '')
        await delay(300)
        Messages.events.personaChanged.sendToAll([{ of: identifier, owned: true, reason: 'new' }])
    })
}
