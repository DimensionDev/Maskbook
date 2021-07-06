import { useAsyncFn } from 'react-use'
import { Messages, Services } from '../../../API'
import { delay } from '@masknet/shared'

export function useCreatePersonaV2() {
    return useAsyncFn(async (mnemonicWord: string, nickName: string) => {
        const identifier = await Services.Identity.createPersonaByMnemonicV2(mnemonicWord, nickName, '')
        console.log(identifier)
        await delay(300)
        Messages.events.personaChanged.sendToAll([{ of: identifier, owned: true, reason: 'new' }])
    })
}
