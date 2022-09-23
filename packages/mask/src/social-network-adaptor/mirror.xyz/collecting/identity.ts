import { delay } from '@dimensiondev/kit'
import { EnhanceableSite } from '@masknet/shared-base'
import { Mirror, Writer } from '@masknet/web3-providers'
import type { SocialNetworkUI } from '../../../social-network/types'
import { creator } from '../../../social-network/utils'
import { formatWriter } from './utils.js'

export const getCurrentUserInfo = async () => {
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

        ref.value = formatWriter(writer)
    }

    assign()

    window.addEventListener('locationchange', assign, { signal: cancel })
}

export const getUserInfo = () => {
    const script = document.getElementById('__NEXT_DATA__')?.innerHTML
    if (!script) return
    const INIT_DATA = JSON.parse(script)
    if (!INIT_DATA) return
    const writer = INIT_DATA.props?.pageProps?.project as Writer
    return formatWriter(writer)
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
            ref.value = formatWriter(currentUser)
            return
        }
        ref.value = formatWriter(writer)
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
