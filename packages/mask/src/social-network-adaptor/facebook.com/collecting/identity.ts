import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import type { SocialNetworkUI } from '@masknet/types'
import { creator } from '../../../social-network/index.js'
import { getProfileIdentifierAtFacebook, getUserID } from '../utils/getProfileIdentifier.js'
import { isMobileFacebook } from '../utils/isMobile.js'
import { ProfileIdentifier, EnhanceableSite, type ValueRef } from '@masknet/shared-base'
import { searchFacebookAvatarSelector, searchUserIdOnMobileSelector } from '../utils/selector.js'
import { getAvatar, getBioDescription, getFacebookId, getNickName, getPersonalHomepage } from '../utils/user.js'
import { delay } from '@masknet/kit'
import type { IdentityResolved } from '@masknet/plugin-infra'

export const IdentityProviderFacebook: SocialNetworkUI.CollectingCapabilities.IdentityResolveProvider = {
    hasDeprecatedPlaceholderName: true,
    recognized: creator.EmptyIdentityResolveProviderState(),
    start(signal) {
        resolveLastRecognizedIdentityFacebookInner(this.recognized, signal)
    },
}

function resolveLastRecognizedIdentityFacebookInner(ref: ValueRef<IdentityResolved>, signal: AbortSignal) {
    const self = (isMobileFacebook ? myUsernameLiveSelectorMobile : myUsernameLiveSelectorPC)
        .clone()
        .map((x) => getProfileIdentifierAtFacebook(x, false))
    new MutationObserverWatcher(self)
        .addListener('onAdd', (e) => assign(e.value))
        .addListener('onChange', (e) => assign(e.newValue))
        .startWatch({ childList: true, subtree: true, characterData: true }, signal)
    function assign(i: IdentityResolved) {
        if (i.identifier) ref.value = i
    }
    fetch(new URL('/me', location.href), { method: 'HEAD', signal })
        .then((x) => x.url)
        .then(getUserID)
        .then((id) => {
            const nickname = getNickName()
            const avatar = getAvatar()
            assign({
                ...ref.value,
                nickname,
                avatar,
                isOwner: true,
                identifier: ProfileIdentifier.of(EnhanceableSite.Facebook, id).unwrapOr(undefined),
            })
        })
}

function resolveCurrentVisitingIdentityInner(
    ref: SocialNetworkUI.CollectingCapabilities.IdentityResolveProvider['recognized'],
    ownerRef: SocialNetworkUI.CollectingCapabilities.IdentityResolveProvider['recognized'],
    cancel: AbortSignal,
) {
    const selector = isMobileFacebook ? searchUserIdOnMobileSelector() : searchFacebookAvatarSelector()

    const assign = async () => {
        await delay(3000)
        const nickname = getNickName()
        const bio = getBioDescription()
        const handle = getFacebookId()
        const ownerHandle = ownerRef.value.identifier?.userId
        const isOwner = !!(handle && ownerHandle && handle.toLowerCase() === ownerHandle.toLowerCase())
        const homepage = getPersonalHomepage()
        const avatar = getAvatar()

        ref.value = {
            identifier: ProfileIdentifier.of(EnhanceableSite.Facebook, handle).unwrapOr(undefined),
            nickname,
            avatar,
            bio,
            homepage,
            isOwner,
        }
    }

    const createWatcher = (selector: LiveSelector<HTMLElement, boolean>) => {
        new MutationObserverWatcher(selector)
            .addListener('onAdd', () => assign())
            .addListener('onChange', () => assign())
            .startWatch(
                {
                    childList: true,
                    subtree: true,
                    attributes: true,
                },
                cancel,
            )
        window.addEventListener('locationchange', assign, { signal: cancel })
    }

    assign()

    createWatcher(selector)
}

export const CurrentVisitingIdentityProviderFacebook: SocialNetworkUI.CollectingCapabilities.IdentityResolveProvider = {
    hasDeprecatedPlaceholderName: false,
    recognized: creator.EmptyIdentityResolveProviderState(),
    start(cancel) {
        resolveCurrentVisitingIdentityInner(this.recognized, IdentityProviderFacebook.recognized, cancel)
    },
}

// #region LS
// Try to resolve my identities
const myUsernameLiveSelectorPC = new LiveSelector()
    .querySelectorAll<HTMLAnchorElement>(
        '[data-pagelet="LeftRail"] > [data-visualcompletion="ignore-dynamic"]:first-child > div:first-child > ul [role="link"]',
    )

    .filter((x) => x.innerText)
const myUsernameLiveSelectorMobile = new LiveSelector().querySelector<HTMLAnchorElement>(
    '#bookmarks_flyout .mSideMenu > div > ul > li:first-child a, #MComposer a',
)

// #endregion
