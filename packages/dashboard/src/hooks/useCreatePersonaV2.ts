import { delay } from '@masknet/shared-base'
import { Messages, Services } from '../API'

export function useCreatePersonaV2() {
    return async (mnemonicWord: string, nickName: string) => {
        const identifier = await Services.Identity.createPersonaByMnemonicV2(mnemonicWord, nickName, '')
        await delay(300)
        Messages.events.ownPersonaChanged.sendToAll(undefined)

        return identifier
    }
}

export function useCreatePersonaByPrivateKey() {
    return async (privateKey: string, nickName: string) => {
        const identifier = await Services.Identity.createPersonaByPrivateKey(privateKey, nickName)
        await delay(300)
        Messages.events.ownPersonaChanged.sendToAll(undefined)

        return identifier
    }
}
