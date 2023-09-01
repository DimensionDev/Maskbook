import { delay } from '@masknet/kit'
import { MaskMessages } from '@masknet/shared-base'
import Services from '#services'

export function useCreatePersonaV2() {
    return async (mnemonicWord: string, nickName: string) => {
        const identifier = await Services.Identity.createPersonaByMnemonicV2(mnemonicWord, nickName, '')
        await delay(300)
        MaskMessages.events.ownPersonaChanged.sendToAll(undefined)
        return identifier
    }
}

export function useCreatePersonaByPrivateKey() {
    return async (privateKey: string, nickName: string) => {
        const identifier = await Services.Identity.createPersonaByPrivateKey(privateKey, nickName)
        await delay(300)
        MaskMessages.events.ownPersonaChanged.sendToAll(undefined)
        return identifier
    }
}
