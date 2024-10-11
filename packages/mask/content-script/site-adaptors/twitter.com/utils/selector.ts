import { LiveSelector } from '@dimensiondev/holoflows-kit'
import { regexMatch } from '../../../utils/regexMatch.js'
import { isCompose } from './postBox.js'

type E = HTMLElement

export function querySelector<T extends E, SingleMode extends boolean = true>(selector: string, singleMode = true) {
    const ls = new LiveSelector<T, SingleMode>().querySelector<T>(selector)
    return (singleMode ? ls.enableSingleMode() : ls) as LiveSelector<T, SingleMode>
}
export function querySelectorAll<T extends E>(selector: string) {
    return new LiveSelector().querySelectorAll<T>(selector)
}

// #region "Enhanced Profile"
export function searchProfileTabListLastChildSelector() {
    // :not(:has(a[href^="/i/"])) excludes tab list in trending page. See MF-6382
    return querySelector<E>(
        '[data-testid="primaryColumn"] div + [role="navigation"][aria-label] [data-testid="ScrollSnap-List"]:not(:has(a[href^="/i/"])) div[role="presentation"]:last-of-type a[role="tab"]',
    ).closest<E>(1)
}
export function nextTabListSelector() {
    return querySelector('[data-testid="ScrollSnap-nextButtonWrapper"]')
}
export function searchProfileTabPageSelector() {
    return searchProfileTabListLastChildSelector()
        .closest(5)
        .querySelector<E>('section > div[aria-label]:not([role="progressbar"])')
}

export function searchProfileTabLoseConnectionPageSelector() {
    return querySelector<E>(
        '[data-testid="primaryColumn"] [role="navigation"] + * > div[dir="auto"]:not([role="progressbar"])',
    )
}

export function searchProfileEmptySelector() {
    return querySelector<E>('[data-testid="primaryColumn"] [data-testid="emptyState"]')
}
export function searchProfileTabSelector() {
    return querySelector<E>('[aria-label][role="navigation"] [role="tablist"] [role="tab"][aria-selected="false"]')
}
export function searchAppBarBackSelector() {
    return querySelector<E>('[data-testid="app-bar-back"] > div')
}
export function searchProfileTabListSelector() {
    return querySelectorAll('[aria-label][role="navigation"] [role="tablist"][data-testid="ScrollSnap-List"] a')
}
export function searchNewTweetButtonSelector() {
    const q = querySelector<E>('[data-testid="FloatingActionButtons_Tweet_Button"]')
    if (q.evaluate()) return q
    return querySelector<E>('[data-testid="SideNav_NewTweet_Button"]')
}

export function searchAvatarSelector() {
    return querySelector<HTMLImageElement>('[data-testid="primaryColumn"] a[href$="/photo"] img[src*="profile_images"]')
}

export function searchAvatarMetaSelector() {
    return querySelector<E>('head meta[property="og:image"]')
}

export function profileFollowButtonSelector() {
    return querySelector<E>(
        '[data-testid="primaryColumn"] [aria-haspopup="menu"][data-testid="userActions"] ~ [data-testid="placementTracking"]',
    )
}

export function normalFollowButtonSelector() {
    return querySelectorAll(
        '[data-testid="primaryColumn"] [role="button"][data-testid="UserCell"] [data-testid$="follow"]',
    )
}

export function searchProfileCoverSelector() {
    return querySelector<E>(
        '[data-testid="primaryColumn"] > div > div:last-child > div > div > div > div > div > div[style], [data-testid="primaryColumn"] > div > div:last-child > div > div > div > a > div > div[style]',
    ).closest<E>(1)
}

export function searchEditProfileSelector() {
    return querySelector<E>('[data-testid="primaryColumn"] [data-testid^="UserAvatar-Container-"]')
        .closest(1)
        .querySelector<E>('a[href="/settings/profile"]')
}
// #endregion

export function rootSelector() {
    return querySelector<E>('#react-root')
}

// `aside *` selectors are for mobile mode
export function composeAnchorSelector() {
    return querySelector<HTMLAnchorElement>(
        [
            'header[role=banner] a[href="/compose/post"]',
            'aside a[href="/compose/post"]',
            // can't see the compose button on share popup, use the tweetButton instead
            '[role=main] [role=button][data-testid=tweetButton]',
        ].join(','),
    )
}

export function postEditorContentInPopupSelector() {
    return querySelector<E>(
        '[aria-labelledby="modal-header"] > div:first-child > div:first-child > div:first-child > div:nth-child(3)',
    )
}
export function postEditorInPopupSelector() {
    return querySelector<E>('div[data-testid="toolBar"] [role="presentation"]:has(> button[data-testid="geoButton"])')
}
export function sideBarProfileSelector() {
    return querySelector<E>('[role="banner"] [role="navigation"] [data-testid="AppTabBar_Profile_Link"] > div')
}
export function postEditorInTimelineSelector() {
    return querySelector<E>(
        '[role="main"] :not(aside) > [role="progressbar"] ~ div [role="button"][aria-label]:nth-child(6)',
    )
}

export function isReplyPageSelector() {
    return !!location.pathname.match(/^\/\w+\/status\/\d+$/)
}
export function postEditorDraftContentSelector() {
    if (location.pathname === '/compose/post') {
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

export function searchResultHeadingSelector() {
    return querySelector<E>('[role="main"] [data-testid="primaryColumn"] > div > :nth-child(2)')
}

export function newPostButtonSelector() {
    return querySelector<E>('[data-testid="SideNav_NewTweet_Button"]')
}

export function bioPageUserNickNameSelector() {
    return querySelector<HTMLDivElement>('[data-testid="UserDescription"]')
        .map((x) => x.parentElement?.parentElement?.previousElementSibling)
        .querySelector<HTMLDivElement>('div[dir]')
}

export function bioPageUserIDSelector(selector: () => LiveSelector<HTMLSpanElement, true>) {
    return selector().map((x) => (x.parentElement?.nextElementSibling as HTMLElement)?.innerText?.replace('@', ''))
}

export function floatingBioCardSelector() {
    return querySelector<HTMLSpanElement>(
        '[style~="left:"] a[role=link] > div:first-child > div:first-child > div:first-child[dir="auto"]',
    )
}

export function postsImageSelector(node: HTMLElement) {
    return new LiveSelector([node]).querySelectorAll<HTMLElement>(
        [
            '[data-testid="tweet"] > div > div img[src*="media"]',
            '[data-testid="tweet"] ~ div img[src*="media"]', // image in detail page for new twitter
        ].join(','),
    )
}

export function timelinePostContentSelector() {
    return querySelectorAll(
        [
            '[data-testid="tweet"] div + div div[lang]',
            '[data-testid="tweet"] div + div div[data-testid="card.wrapper"]', // link box tweets
        ].join(','),
    )
}

export function toastLinkSelector() {
    return querySelector<HTMLLinkElement>('[data-testid="toast"] a')
}

export function postsContentSelector() {
    return querySelectorAll(
        [
            // tweets on timeline page
            '[data-testid="tweet"] [data-testid="tweetText"]',
            '[data-testid="tweet"]:not(:has([data-testid="tweetText"])) [data-testid="tweetPhoto"]', // tweets with only image.

            // tweets on detailed page
            '[data-testid="tweet"] + div > div:first-child div[lang]',
            '[data-testid="tweet"] + div > div div[data-testid="card.wrapper"]',

            // tweets have only link that rendered as social media card
            '[data-testid="tweet"] [data-testid="card.wrapper"]',

            // quoted tweets in timeline
            '[data-testid="tweet"] [aria-labelledby] div[role="link"] div[lang]',
            // quoted tweets in detail page
            '[data-testid="tweet"] > div:last-child div[role="link"] div[lang]',
        ].join(','),
    )
}

export function postAvatarSelector() {
    return querySelectorAll('[data-testid=tweet] [data-testid^=UserAvatar-Container-]')
}
export function followUserAvatarSelector() {
    return querySelectorAll('[data-testid=UserCell] [data-testid^=UserAvatar-Container-]')
}

const base = querySelector<HTMLScriptElement>('#react-root ~ script')
const handle = /"screen_name":"(.*?)"/
const name = /"name":"(.*?)"/
const bio = /"description":"(.*?)"/
const avatar = /"profile_image_url_https":"(.*?)"/
/**
 * first matched element can be extracted by index zero, followings are all capture groups, if no 'g' specified.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match
 */
function p(regex: RegExp, index: number) {
    return base.clone().map((x) => regexMatch(x.innerText, regex, index))
}
export function selfInfoSelectors() {
    return {
        handle: p(handle, 1),
        name: p(name, 1),
        bio: p(bio, 1),
        userAvatar: p(avatar, 1),
    }
}

// #region self info
export function searchSelfHandleSelector() {
    return querySelector<HTMLSpanElement>(
        [
            '[data-testid="SideNav_AccountSwitcher_Button"] > div > div[data-testid^="UserAvatar-Container-"]', // desktop
            '#layers [role="group"] [role="dialog"] [tabindex="-1"] [dir="ltr"] > span', // sidebar opened in mobile
        ].join(','),
    )
}

export function searchSelfNicknameSelector() {
    return querySelector<HTMLSpanElement>(
        [
            '[data-testid="SideNav_AccountSwitcher_Button"] span span:first-child',
            '#layers [role="group"] [role="dialog"] [role="link"] span > span', // sidebar opened in mobile
        ].join(','),
    )
}

export function searchWatcherAvatarSelector() {
    return querySelector<HTMLImageElement>('[data-testid="SideNav_AccountSwitcher_Button"] img')
}

export function searchSelfAvatarSelector() {
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
export function searchProfileAvatarSelector() {
    return querySelector<E>('[data-testid="Profile_Save_Button"]')
        .closest<E>(8)
        .querySelector('[data-testid="UserAvatar-Container-unknown"]')
        .closest<E>(3)
}

export function searchProfileSaveSelector() {
    return querySelector<E>('[data-testid="Profile_Save_Button"]')
}

// #region avatar selector
export function searchTwitterAvatarLinkSelector() {
    return querySelector<E>('[data-testid="UserProfileHeader_Items"]').closest<E>(2).querySelector('div  a')
}

export function searchTwitterAvatarSelector() {
    return querySelector<E>('a[href$="/photo"]').querySelector('img').closest<E>(1)
}
// #endregion

export function searchTweetAvatarSelector() {
    return querySelector<E, false>('[data-testid="tweetButtonInline"]').closest<E>(7)
}

export function searchRetweetAvatarSelector() {
    return querySelector<E, false>('[data-testid="tweetButton"]').closest<E>(6)
}

export function searchReplyToolbarSelector() {
    return querySelector<E>(
        'div[data-testid="primaryColumn"] div[data-testid="toolBar"] [role="presentation"]:has(> button[data-testid="geoButton"])',
    )
}

// nameTag dom
export function searchNameTag() {
    return querySelector<E>('#nft-gallery')
}

export function searchHomeLinkName() {
    return querySelector<E>('[data-testid="AppTabBar_Home_Link"]')
}
