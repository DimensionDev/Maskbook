import { creator } from '../../../social-network/index.js'
import type { SocialNetworkUI } from '@masknet/social-network-infra'
import { ProfileIdentifier } from '@masknet/shared-base'
import { openseaBase } from '../base.js'
import type { IdentityResolved } from '@masknet/plugin-infra'
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
    function cookie2Json() {
        const res = decodeURIComponent(document.cookie)
            .split('; ')
            .find((x) => x.includes('wallet={'))

        if (!res) return ''
        const [, value] = res.split('wallet=')
        if (!value) return ''

        return JSON.parse(value)
    }
    function getBioByCookie() {
        const empty = {
            username: '',
            profilePictureUrl: '',
            fullName: '',
        }
        if (document.cookie.length) {
            const _res = cookie2Json()
            const raw = _res.activeAccount
            if (!_res.activeAccount) return empty
            return {
                ...raw,
                profilePictureUrl: raw.imageUrl,
                username: raw.user.username,
                nickname: raw.nickname,
            }
        }

        return empty
    }
    const detail = await getBioByCookie()
    return {
        identifier: ProfileIdentifier.of(openseaBase.networkIdentifier, detail.username).unwrapOr(undefined),
        avatar: detail.profilePictureUrl,
        nickname: detail.nickname,
    }
}
