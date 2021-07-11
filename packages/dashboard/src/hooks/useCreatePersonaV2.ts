import { delay } from '@masknet/shared'
import { Messages, Services } from '../API'
export function useCreatePersonaV2() {
    return async (mnemonicWord: string, nickName: string) => {
        try {
            const identifier = await Services.Identity.createPersonaByMnemonicV2(mnemonicWord, nickName, '')
            await delay(300)
            Messages.events.personaChanged.sendToAll([{ of: identifier, owned: true, reason: 'new' }])
        } catch (e) {
            // todo: i18n
            throw new Error('Create Account Failed')
        }
    }
}
