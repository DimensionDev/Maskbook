import type { SocialNetworkUI as Next } from '@masknet/types'
import { ProfileIdentifier } from '@masknet/shared-base'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { creator } from '../../../social-network/index.js'
import { openseaBase } from '../base.js'

export const IdentityProviderOpensea: Next.CollectingCapabilities.IdentityResolveProvider = {
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
async function query(): Promise<null | IdentityResolved> {
    const detail = await getBioByCookie()
    return {
        identifier: ProfileIdentifier.of(openseaBase.networkIdentifier, detail.username).unwrapOr(undefined),
        avatar: detail.profilePictureUrl,
        nickname: detail.nickname,
    }
}

export const CurrentVisitingIdentityProviderOpenSea: Next.CollectingCapabilities.IdentityResolveProvider = {
    hasDeprecatedPlaceholderName: false,
    recognized: creator.EmptyIdentityResolveProviderState(),
    start(cancel) {},
}
