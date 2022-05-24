import { LiveSelector, MutationObserverWatcher, ValueRef } from '@dimensiondev/holoflows-kit'
import { creator, SocialNetworkUI } from '../../../social-network'
import { getProfileIdentifierAtFacebook, getUserID } from '../utils/getProfileIdentifier'
import { isMobileFacebook } from '../utils/isMobile'
import { ProfileIdentifier, EnhanceableSite } from '@masknet/shared-base'
import { searchAvatarSelector, searchUserIdOnMobileSelector } from '../utils/selector'
import { getAvatar, getBioDescription, getFacebookId, getNickName, getPersonalHomepage } from '../utils/user'
import { delay } from '@dimensiondev/kit'
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
    fetch('/me', { method: 'HEAD', signal })
        .then((x) => x.url)
        .then(getUserID)
        .then((id) =>
            assign({
                ...ref.value,
                identifier: ProfileIdentifier.of(EnhanceableSite.Facebook, id).unwrapOr(undefined),
            }),
        )
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
        const homepage = getPersonalHomepage()

        const avatar = getAvatar()

        ref.value = {
            identifier: ProfileIdentifier.of(EnhanceableSite.Facebook, handle).unwrapOr(undefined),
            nickname,
            avatar,
            bio,
            homepage,
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

// #endregion
