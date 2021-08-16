import { delay } from '@masknet/shared'
import { Messages, Services } from '../API'
import { useDashboardI18N } from '../locales'

export function useCreatePersonaV2() {
    const t = useDashboardI18N()
    return async (mnemonicWord: string, nickName: string) => {
        try {
            const identifier = await Services.Identity.createPersonaByMnemonicV2(mnemonicWord, nickName, '')
            await delay(300)
            Messages.events.personaChanged.sendToAll([{ of: identifier, owned: true, reason: 'new' }])
        } catch {
            throw new Error(t.create_account_failed())
        }
    }
}
