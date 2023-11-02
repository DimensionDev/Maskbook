import { delay } from '@masknet/kit'
import { EnhanceableSite, getCookie } from '@masknet/shared-base'
import { Mirror } from '@masknet/web3-providers'
import type { Writer } from '@masknet/web3-providers/types'
import type { SiteAdaptorUI } from '@masknet/types'
import { creator } from '../../../site-adaptor-infra/utils.js'
import { formatWriter, getMirrorUserId } from './utils.js'

async function getCurrentUserInfo() {
    if (location.host !== EnhanceableSite.Mirror) return
    const userAddress = getCookie('user_wallet')

    if (!userAddress) return
    return Mirror.getWriter(userAddress)
}

function resolveLastRecognizedIdentityInner(
    ref: SiteAdaptorUI.CollectingCapabilities.IdentityResolveProvider['recognized'],
    cancel: AbortSignal,
) {
    const assign = async () => {
        await delay(2000)

        const writer = await getCurrentUserInfo()
        if (!writer) return

        ref.value = formatWriter(writer, true)
    }

    assign()

    window.addEventListener('locationchange', assign, { signal: cancel })
}

function resolveCurrentVisitingIdentityInner(
    ref: SiteAdaptorUI.CollectingCapabilities.IdentityResolveProvider['recognized'],
    ownerRef: SiteAdaptorUI.CollectingCapabilities.IdentityResolveProvider['recognized'],
    cancel: AbortSignal,
) {
    const assign = async () => {
        // get from mirror api
        const userId = getMirrorUserId(location.href)
        const ownerId = ownerRef.value.identifier?.userId
        const isOwner = !!(userId && ownerId && userId.toLowerCase() === ownerId.toLowerCase())
        if (userId) {
            const writer = await Mirror.getWriter(userId)
            if (writer) {
                ref.value = formatWriter(writer, isOwner)
                return
            }
        }
        // Could be `/dashboard` or `/dashboard/settings`
        if (location.pathname.startsWith('/dashboard')) {
            ref.value = {}
            return
        }

        // get from local
        // why local as second option?
        // when location change, then __NEXT_DATA__ data could be stale,
        const script = document.getElementById('__NEXT_DATA__')?.innerHTML
        if (!script) return
        const INIT_DATA = JSON.parse(script)
        if (!INIT_DATA) return

        const writer = (INIT_DATA.props?.pageProps?.publicationLayoutProject ??
            INIT_DATA.props?.pageProps?.project) as Writer
        ref.value = formatWriter(writer, isOwner)
    }

    assign()

    window.addEventListener('locationchange', assign, { signal: cancel })
}

export const IdentityProviderMirror: SiteAdaptorUI.CollectingCapabilities.IdentityResolveProvider = {
    hasDeprecatedPlaceholderName: false,
    recognized: creator.EmptyIdentityResolveProviderState(),
    start(cancel) {
        resolveLastRecognizedIdentityInner(this.recognized, cancel)
    },
}

export const CurrentVisitingIdentityProviderMirror: SiteAdaptorUI.CollectingCapabilities.IdentityResolveProvider = {
    hasDeprecatedPlaceholderName: false,
    recognized: creator.EmptyIdentityResolveProviderState(),
    start(cancel) {
        resolveCurrentVisitingIdentityInner(this.recognized, IdentityProviderMirror.recognized, cancel)
    },
}
