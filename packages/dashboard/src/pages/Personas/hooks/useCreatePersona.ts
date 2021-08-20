import { useAsyncFn } from 'react-use'
import { Messages, Services } from '../../../API'
import { delay } from '@masknet/shared'
import type { AsyncFnReturn } from 'react-use/lib/useAsyncFn'

export function useCreatePersona(): AsyncFnReturn<(nickName: string) => Promise<void>> {
    return useAsyncFn(async (nickName: string) => {
        // TODO: should second parameter be the password?
        const identifier = await Services.Identity.createPersonaByMnemonic(nickName, '')
        await delay(300)
        Messages.events.personaChanged.sendToAll([{ of: identifier, owned: true, reason: 'new' }])
    })
}
