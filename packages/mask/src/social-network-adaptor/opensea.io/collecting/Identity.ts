import { SocialNetworkUI, creator } from '../../../social-network'
import { ProfileIdentifier } from '@masknet/shared-base'
import { openseaBase } from '../base'
export const IdentityProviderOpensea: SocialNetworkUI.CollectingCapabilities.IdentityResolveProvider = {
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
    recognized: creator.EmptyIdentityResolveProviderState(),
}

async function query(): Promise<null | SocialNetworkUI.CollectingCapabilities.IdentityResolved> {
    // temp
    const detail = {
        username: 'Unnamed',
        profilePictureUrl: '',
        fullName: 'Unnamed',
    }
    return {
        identifier: new ProfileIdentifier(openseaBase.networkIdentifier, detail.username),
        avatar: detail.profilePictureUrl,
        nickname: detail.fullName,
    }
}
