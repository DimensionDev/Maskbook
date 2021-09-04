import { SocialNetworkUI, creator } from '../../../social-network'
import { ProfileIdentifier } from '@masknet/shared'
import { instagramBase } from '../base'
import { openDB } from 'idb'
export const IdentityProviderInstagram: SocialNetworkUI.CollectingCapabilities.IdentityResolveProvider = {
    async start(signal) {
        const ref = this.recognized
        update()

        async function update() {
            if (signal.aborted) return
            const val = await query()
            if (val) ref.value = val
            setTimeout(update, 10 * 1000)
        }
    },
    recognized: creator.IdentityResolveProviderLastRecognized(),
}

async function query(): Promise<null | SocialNetworkUI.CollectingCapabilities.IdentityResolved> {
    const db = await openDB('redux', 1, {
        upgrade: () => {
            db.createObjectStore('paths')
        },
    })
    const tx = db.transaction('paths', 'readonly')
    const id = await tx.store.get('users.viewerId')
    if (!id) return null
    const detail = (await tx.store.get('users.users'))[id]
    db.close()
    return {
        identifier: new ProfileIdentifier(instagramBase.networkIdentifier, detail.username),
        avatar: detail.profilePictureUrl,
        nickname: detail.fullName,
    }
}
