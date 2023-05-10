import { LiveSelector } from '@dimensiondev/holoflows-kit'
import { regexMatch } from '../../../utils/utils.js'
import { isCompose } from './postBox.js'

type E = HTMLElement

export const querySelector = <T extends E, SingleMode extends boolean = true>(selector: string, singleMode = true) => {
    const ls = new LiveSelector<T, SingleMode>().querySelector<T>(selector)
    return (singleMode ? ls.enableSingleMode() : ls) as LiveSelector<T, SingleMode>
}
export const querySelectorAll = <T extends E>(selector: string) => {
    return new LiveSelector().querySelectorAll<T>(selector)
}

// #region "Enhanced Profile"
export const searchProfileTabListLastChildSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>(
        '[data-testid="primaryColumn"] div + [role="navigation"][aria-label] [data-testid="ScrollSnap-nextButtonWrapper"]',
    )

export const searchProfileTabPageSelector = () =>
    searchProfileTabListLastChildSelector()
        .closest(3)
        .querySelector<E>('section > div[aria-label]:not([role="progressbar"])')

export const searchProfileTabLoseConnectionPageSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>(
        '[data-testid="primaryColumn"] [role="navigation"] + * > div[dir="auto"]:not([role="progressbar"])',
    )

export const searchProfileEmptySelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[data-testid="primaryColumn"] [data-testid="emptyState"]')
export const searchProfileTabSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[aria-label][role="navigation"]  [role="tablist"] [role="tab"][aria-selected="false"]')
export const searchAppBarBackSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[data-testid="app-bar-back"] > div')
export const searchProfileTabListSelector = () =>
    querySelectorAll('[aria-label][role="navigation"]  [role="tablist"][data-testid="ScrollSnap-List"] a')
export const searchNewTweetButtonSelector: () => LiveSelector<E, true> = () => {
    const q = querySelector<E>('[data-testid="FloatingActionButtons_Tweet_Button"]')
    if (q.evaluate()) return q
    return querySelector<E>('[data-testid="SideNav_NewTweet_Button"]')
}

export const searchNickNameSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[data-testid="primaryColumn"] [data-testid="UserName"] div[dir="auto"] > span > span')
export const searchAvatarSelector = () =>
    querySelector<HTMLImageElement>('[data-testid="primaryColumn"] a[href$="/photo"] img[src*="profile_images"]')
export const searchNFTAvatarSelector = () =>
    querySelector<HTMLImageElement>('[data-testid="primaryColumn"] a[href$="/nft"] img[src*="profile_images"]')
export const searchAvatarMetaSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('head meta[property="og:image"]')

export const profileFollowButtonSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>(
        '[data-testid="primaryColumn"] [aria-haspopup="menu"][data-testid="userActions"] ~ [data-testid="placementTracking"]',
    )

export const normalFollowButtonSelector = () =>
    // Follow button and unfollow button in following and followers list
    querySelectorAll('[data-testid="primaryColumn"] [role="button"][data-testid="UserCell"] [data-testid$="follow"]')

export const searchProfileCoverSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>(
        '[data-testid="primaryColumn"] > div > div:last-child > div > div > div > div > div > div[style], [data-testid="primaryColumn"] > div > div:last-child > div > div > div > a > div > div[style]',
    ).closest(1)

export const searchEditProfileSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[data-testid="primaryColumn"] [data-testid^="UserAvatar-Container-"]')
        .closest(1)
        .querySelector('a[href="/settings/profile"]')
// #endregion

export const rootSelector: () => LiveSelector<E, true> = () => querySelector<E>('#react-root')

// `aside *` selectors are for mobile mode
export const composeAnchorSelector: () => LiveSelector<HTMLAnchorElement, true> = () =>
    querySelector<HTMLAnchorElement>(
        [
            'header[role=banner] a[href="/compose/tweet"]',
            'aside a[href="/compose/tweet"]',
            // can't see the compose button on share popup, use the tweetButton instead
            '[role=main] [role=button][data-testid=tweetButton]',
        ].join(','),
    )

export const postEditorContentInPopupSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>(
        '[aria-labelledby="modal-header"] > div:first-child > div:first-child > div:first-child > div:nth-child(3)',
    )
export const postEditorInPopupSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[aria-labelledby="modal-header"]  div[data-testid="toolBar"] div[data-testid="geoButton"]')
export const sideBarProfileSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[role="banner"] [role="navigation"] [data-testid="AppTabBar_Profile_Link"] > div')
export const postEditorInTimelineSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[role="main"] :not(aside) > [role="progressbar"] ~ div [role="button"][aria-label]:nth-child(6)')

export const isReplyPageSelector = () => !!location.pathname.match(/^\/\w+\/status\/\d+$/)
export const postEditorDraftContentSelector = () => {
    if (location.pathname === '/compose/tweet') {
        return querySelector<HTMLDivElement>(
            '[contenteditable][aria-label][spellcheck],textarea[aria-label][spellcheck]',
        )
    }
    if (isReplyPageSelector()) {
        return querySelector<HTMLElement>('div[data-testid="tweetTextarea_0"]')
    }
    return (isCompose() ? postEditorInPopupSelector() : postEditorInTimelineSelector()).querySelector<HTMLElement>(
        '.public-DraftEditor-content, [contenteditable][aria-label][spellcheck]',
    )
}

export const searchResultHeadingSelector: () => LiveSelector<E, true> = () =>
    // To match the scenario with no results in timeline.
    querySelector<E>('[role="main"] [data-testid="primaryColumn"] > div > :nth-child(2)')

export const newPostButtonSelector = () => querySelector<E>('[data-testid="SideNav_NewTweet_Button"]')

export const profileBioSelector = () => querySelector<HTMLDivElement>('[data-testid="UserDescription"]')

export const personalHomepageSelector = () => querySelector<HTMLDivElement>('[data-testid="UserUrl"]')

export const bioPageUserNickNameSelector = () =>
    querySelector<HTMLDivElement>('[data-testid="UserDescription"]')
        .map((x) => x.parentElement?.parentElement?.previousElementSibling)
        .querySelector<HTMLDivElement>('div[dir]')

export function isProfilePageLike() {
    return !(
        location.pathname.match(/^\/(home|explore|notifications|messages|i\/|settings|compose)/) &&
        location.pathname.match(/\/(topics|recommended|not_interested|lists)$/)
    )
}

export const bioPageUserIDSelector = (selector: () => LiveSelector<HTMLSpanElement, true>) =>
    selector().map((x) => (x.parentElement?.nextElementSibling as HTMLElement)?.innerText?.replace('@', ''))
export const floatingBioCardSelector = () =>
    querySelector<HTMLSpanElement>(
        '[style~="left:"] a[role=link] > div:first-child > div:first-child > div:first-child[dir="auto"]',
    )

export const postsImageSelector = (node: HTMLElement) =>
    new LiveSelector([node]).querySelectorAll<HTMLElement>(
        [
            '[data-testid="tweet"] > div > div img[src*="media"]',
            '[data-testid="tweet"] ~ div img[src*="media"]', // image in detail page for new twitter
        ].join(','),
    )

export const timelinePostContentSelector = () =>
    querySelectorAll(
        [
            '[data-testid="tweet"] div + div div[lang]',
            '[data-testid="tweet"] div + div div[data-testid="card.wrapper"]', // link box tweets
        ].join(','),
    )

export const toastLinkSelector = () => querySelector<HTMLLinkElement>('[data-testid="toast"] a')

export const postsContentSelector = () =>
    querySelectorAll(
        [
            // tweets on timeline page
            '[data-testid="tweet"] div + div div[lang]',
            '[data-testid="tweet"] div + div div[data-testid="card.wrapper"]',

            // tweets on detailed page
            '[data-testid="tweet"] + div > div:first-child div[lang]',
            '[data-testid="tweet"] + div > div div[data-testid="card.wrapper"]',

            // quoted tweets in timeline
            '[data-testid="tweet"] [aria-labelledby] div[role="link"] div[lang]',
            // quoted tweets in detail page
            '[data-testid="tweet"] > div:last-child div[role="link"] div[lang]',

            // reply-tweets
            '[data-testid="tweet"] + div div div[lang][dir]',
        ].join(','),
    )

export const postAvatarSelector = () => querySelectorAll('[data-testid=tweet] [data-testid^=UserAvatar-Container-]')
export const followUserAvatarSelector = () =>
    querySelectorAll('[data-testid=UserCell] [data-testid^=UserAvatar-Container-]')

const base = querySelector<HTMLScriptElement>('#react-root ~ script')
const handle = /"screen_name":"(.*?)"/
const name = /"name":"(.*?)"/
const bio = /"description":"(.*?)"/
const avatar = /"profile_image_url_https":"(.*?)"/
/**
 * first matched element can be extracted by index zero, followings are all capture groups, if no 'g' specified.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match
 */
const p = (regex: RegExp, index: number) => {
    return base.clone().map((x) => regexMatch(x.innerText, regex, index))
}
export const selfInfoSelectors = () => ({
    handle: p(handle, 1),
    name: p(name, 1),
    bio: p(bio, 1),
    userAvatar: p(avatar, 1),
})

// #region self info
export const searchSelfHandleSelector = () => {
    return querySelector<HTMLSpanElement>(
        [
            '[data-testid="SideNav_AccountSwitcher_Button"] > div:nth-child(2) > div > div:nth-child(2) span', // desktop
            '#layers [role="group"] [role="dialog"] [tabindex="-1"] [dir="ltr"] > span', // sidebar opened in mobile
        ].join(','),
    )
}

export const searchSelfNicknameSelector = () => {
    return querySelector<HTMLSpanElement>(
        [
            '[data-testid="SideNav_AccountSwitcher_Button"] [dir="auto"] span span',
            '#layers [role="group"] [role="dialog"] [role="link"] span > span', // sidebar opened in mobile
        ].join(','),
    )
}

export const searchWatcherAvatarSelector = () =>
    querySelector<HTMLImageElement>('[data-testid="SideNav_AccountSwitcher_Button"] img')

export const searchSelfAvatarSelector = () => {
    return querySelector<HTMLImageElement>(
        [
            '#layers ~ div [role="banner"] [role="button"] img',
            '[data-testid="DashButton_ProfileIcon_Link"] [role="presentation"] img',
            '#layers [role="group"] [role="dialog"] [role="link"] img', // sidebar opened in mobile
        ].join(','),
    )
}
// #endregion

// #region twitter nft avatar
export const searchProfileAvatarSelector = () => {
    return querySelector<E>('[data-testid="Profile_Save_Button"]')
        .closest<E>(8)
        .querySelector('[data-testid="UserAvatar-Container-unknown"]')
        .closest<E>(3)
}

export const searchProfileSaveSelector = () => querySelector<E>('[data-testid="Profile_Save_Button"]')

export const searchProfessionalButtonSelector = () => querySelector<E>('[data-testid*="ProfessionalButton"]')
// #endregion

// #region avatar selector
export const searchTwitterAvatarLinkSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[data-testid="UserProfileHeader_Items"]').closest<E>(2).querySelector('div  a')

export const searchTwitterAvatarSelector = () =>
    querySelector<E>('a[href$="/photo"]').querySelector('img').closest<E>(1)

export const searchTwitterAvatarNormalSelector = () => querySelector<E>('a[href$="/photo"]')

export const searchTwitterCircleAvatarSelector = () =>
    querySelector<E>('a[href$="/nft"]').querySelector('img').closest<E>(1)

// #endregion

export const searchTwitterSquareAvatarSelector = () => querySelector<E>('a[href$="/nft"] > div img')

export const searchTweetAvatarSelector = () =>
    querySelector<E, false>('[data-testid="tweetButtonInline"]').closest<E>(7)

export const searchRetweetAvatarSelector = () => querySelector<E, false>('[data-testid="tweetButton"]').closest<E>(6)

export const searchTwitterAvatarNFTSelector = () =>
    querySelector<E>('a[href$="/nft"]').closest<E>(1).querySelector('a div:nth-child(3) > div')

export const searchTwitterAvatarNFTStyleSelector = () => querySelector<E>('a[href$="/nft"] > div')

export const searchTwitterAvatarNFTLinkSelector = () => querySelector<E>('a[href$="/nft"]')

export const searchReplyToolbarSelector = () =>
    querySelector<E>('div[data-testid="primaryColumn"] div[data-testid="toolBar"]').querySelector<E>(
        'div[data-testid="geoButton"]',
    )

// nameTag dom
export const searchNameTag = () => querySelector<E>('#nft-gallery')

export const searchHomeLinkName = () => querySelector<E>('[data-testid="AppTabBar_Home_Link"]')
