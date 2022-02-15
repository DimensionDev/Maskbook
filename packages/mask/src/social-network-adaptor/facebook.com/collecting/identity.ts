import { LiveSelector, MutationObserverWatcher, ValueRef } from '@dimensiondev/holoflows-kit'

import { creator, SocialNetworkUI } from '../../../social-network'
import { getProfileIdentifierAtFacebook, getUserID } from '../utils/getProfileIdentifier'
import { isMobileFacebook } from '../utils/isMobile'
import { delay, ProfileIdentifier } from '@masknet/shared-base'
import { searchAvatarSelector, searchUserIdOnMobileSelector } from '../utils/selector'
import { getAvatar, getBioDescription, getFacebookId, getNickName } from '../utils/user'

export const IdentityProviderFacebook: SocialNetworkUI.CollectingCapabilities.IdentityResolveProvider = {
    hasDeprecatedPlaceholderName: true,
    recognized: creator.EmptyIdentityResolveProviderState(),
    start(signal) {
        resolveLastRecognizedIdentityFacebookInner(this.recognized, signal)
    },
}

function resolveLastRecognizedIdentityFacebookInner(ref: ValueRef<Value>, signal: AbortSignal) {
    const self = (isMobileFacebook ? myUsernameLiveSelectorMobile : myUsernameLiveSelectorPC)
        .clone()
        .map((x) => getProfileIdentifierAtFacebook(x, false))
    const watcher = new MutationObserverWatcher(self)
        .setComparer(undefined, (a, b) => a.identifier.equals(b.identifier))
        .addListener('onAdd', (e) => assign(e.value))
        .addListener('onChange', (e) => assign(e.newValue))
        .startWatch({
            childList: true,
            subtree: true,
            characterData: true,
        })
    signal.addEventListener('abort', () => watcher.stopWatch())
    function assign(i: Value) {
        if (!i.identifier.isUnknown) ref.value = i
    }
    fetch('/me', { method: 'HEAD', signal })
        .then((x) => x.url)
        .then(getUserID)
        .then((id) => id && assign({ ...ref.value, identifier: new ProfileIdentifier('facebook.com', id) }))
}

function resolveCurrentVisitingIdentityInner(
    ref: SocialNetworkUI.CollectingCapabilities.IdentityResolveProvider['recognized'],
    cancel: AbortSignal,
) {
    const selector = isMobileFacebook ? searchUserIdOnMobileSelector() : searchAvatarSelector()

    const assign = async () => {
        await delay(500)
        const nickname = getNickName()
        const bio = getBioDescription()
        const handle = getFacebookId()

        const avatar = getAvatar()

        ref.value = {
            identifier: new ProfileIdentifier('facebook.com', handle ?? ''),
            nickname,
            avatar,
            bio,
        }
    }

    const createWatcher = (selector: LiveSelector<HTMLElement, boolean>) => {
        const watcher = new MutationObserverWatcher(selector)
            .addListener('onAdd', () => assign())
            .addListener('onChange', () => assign())
            .startWatch({
                childList: true,
                subtree: true,
                attributes: true,
            })
        window.addEventListener('locationchange', assign)
        cancel.addEventListener('abort', () => {
            window.removeEventListener('locationchange', assign)
            watcher.stopWatch()
        })
    }

    assign()

    createWatcher(selector)
}

export const CurrentVisitingIdentityProviderFacebook: SocialNetworkUI.CollectingCapabilities.IdentityResolveProvider = {
    hasDeprecatedPlaceholderName: false,
    recognized: creator.EmptyIdentityResolveProviderState(),
    start(cancel) {
        resolveCurrentVisitingIdentityInner(this.recognized, cancel)
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

type Value = SocialNetworkUI.CollectingCapabilities.IdentityResolved
// #endregion
