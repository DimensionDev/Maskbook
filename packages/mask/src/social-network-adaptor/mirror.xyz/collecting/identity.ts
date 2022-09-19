import { delay } from '@dimensiondev/kit'
import { EnhanceableSite, ProfileIdentifier } from '@masknet/shared-base'
import { Mirror, Writer } from '@masknet/web3-providers'
import urlcat from 'urlcat'
import type { SocialNetworkUI } from '../../../social-network/types'
import { creator } from '../../../social-network/utils'
import { mirrorBase } from '../base'

const getMirrorProfileUrl = (id: string) => urlcat('https://mirror.xyz/:id', { id })
const getCurrentUserInfo = async () => {
    if (location.host !== EnhanceableSite.Mirror) return
    const userAddress = localStorage.getItem('mirror.userAddress') as string | null

    if (!userAddress) return
    return Mirror.getWriter(userAddress)
}

function resolveLastRecognizedIdentityInner(
    ref: SocialNetworkUI.CollectingCapabilities.IdentityResolveProvider['recognized'],
    cancel: AbortSignal,
) {
    const assign = async () => {
        await delay(2000)

        const writer = await getCurrentUserInfo()
        if (!writer) return

        ref.value = {
            avatar: writer.avatarURL,
            nickname: writer.displayName,
            identifier: ProfileIdentifier.of(mirrorBase.networkIdentifier, writer.address).unwrapOr(undefined),
            bio: writer.description,
            homepage: writer.domain || getMirrorProfileUrl(writer.address),
        }
    }

    assign()

    window.addEventListener('locationchange', assign, { signal: cancel })
}

function resolveCurrentVisitingIdentityInner(
    ref: SocialNetworkUI.CollectingCapabilities.IdentityResolveProvider['recognized'],
    cancel: AbortSignal,
) {
    const assign = async () => {
        const script = document.getElementById('__NEXT_DATA__')?.innerHTML
        if (!script) return
        const INIT_DATA = JSON.parse(script)
        if (!INIT_DATA) return
        const writer = INIT_DATA.props?.pageProps?.project as Writer
        if (!writer) {
            if (location.pathname.includes('/dashboard')) return

            // when current page is dashboard
            const currentUser = await getCurrentUserInfo()
            if (!currentUser) return
            ref.value = {
                avatar: currentUser.avatarURL,
                nickname: currentUser.displayName,
                bio: currentUser.description,
                homepage: currentUser.domain || getMirrorProfileUrl(currentUser.address),
                identifier: ProfileIdentifier.of(mirrorBase.networkIdentifier, currentUser.address).unwrapOr(undefined),
            }
            return
        }
        ref.value = {
            avatar: writer.avatarURL,
            nickname: writer.displayName,
            bio: writer.description,
            homepage: writer.domain || getMirrorProfileUrl(writer.address),
            identifier: ProfileIdentifier.of(mirrorBase.networkIdentifier, writer.address).unwrapOr(undefined),
        }
    }

    assign()

    window.addEventListener('locationchange', assign, { signal: cancel })
}

export const IdentityProviderMirror: SocialNetworkUI.CollectingCapabilities.IdentityResolveProvider = {
    hasDeprecatedPlaceholderName: false,
    recognized: creator.EmptyIdentityResolveProviderState(),
    start(cancel) {
        resolveLastRecognizedIdentityInner(this.recognized, cancel)
    },
}

export const CurrentVisitingIdentityProviderMirror: SocialNetworkUI.CollectingCapabilities.IdentityResolveProvider = {
    hasDeprecatedPlaceholderName: false,
    recognized: creator.EmptyIdentityResolveProviderState(),
    start(cancel) {
        resolveCurrentVisitingIdentityInner(this.recognized, cancel)
    },
}
