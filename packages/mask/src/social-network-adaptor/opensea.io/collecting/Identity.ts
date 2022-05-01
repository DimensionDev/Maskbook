import { SocialNetworkUI, creator } from '../../../social-network'
import { ProfileIdentifier } from '@masknet/shared-base'
import { openseaBase } from '../base'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { getCookieValue } from '@dimensiondev/kit'
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

async function query(): Promise<null | IdentityResolved> {
    function getBioByCookie() {
        const empty = {
            username: '',
            profilePictureUrl: '',
            fullName: '',
        }
        const wallet = getCookieValue('wallet')
        if (!wallet) return empty
        const _res = JSON.parse(wallet)
        const raw = _res.activeAccount
        if (!_res.activeAccount) return empty
        return {
            ...raw,
            profilePictureUrl: raw.imageUrl,
            username: raw.user.username,
            nickname: raw.nickname,
        }
    }
    const detail = await getBioByCookie()
    return {
        identifier: ProfileIdentifier.of(openseaBase.networkIdentifier, detail.username).unwrapOr(undefined),
        avatar: detail.profilePictureUrl,
        nickname: detail.nickname,
    }
}
