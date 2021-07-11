import { createGlobalState, delay } from '@masknet/shared'
import { Messages, Services } from '../API'
import { useAsync, useAsyncFn } from 'react-use'

export const [useCurrentIdentity] = createGlobalState(Services.Identity.getCurrentIdentity, (x) =>
    Messages.events.identityChanged.on(x),
)
export function useIdentity() {
    const currentIdentityInStore = useCurrentIdentity()

    return useAsync(() => Services.Identity.queryIdentityByKey(currentIdentityInStore), [currentIdentityInStore])
}

export function useCreateIdentity() {
    return useAsyncFn(async (words: string) => {
        try {
            const identifier = await Services.Identity.createIdentityByMnemonic(words, '')
            await delay(300)
            Services.Identity.setCurrentIdentity(identifier.toText())
            Messages.events.identityChanged.sendToAll(identifier)
        } catch (e) {
            // todo: i18n
            throw new Error('Create Account Failed')
        }
    })
}
