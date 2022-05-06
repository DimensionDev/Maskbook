import { LiveSelector } from '@dimensiondev/holoflows-kit'
import { isMobileTwitter } from './isMobile'
import { isCompose } from './postBox'

type E = HTMLElement

export const querySelector = <T extends E, SingleMode extends boolean = true>(selector: string, singleMode = true) => {
    const ls = new LiveSelector<T, SingleMode>().querySelector<T>(selector)
    return (singleMode ? ls.enableSingleMode() : ls) as LiveSelector<T, SingleMode>
}
const querySelectorAll = <T extends E>(selector: string) => {
    return new LiveSelector().querySelectorAll<T>(selector)
}

// #region "Enhanced Profile"
export const searchProfileSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[aria-label][role="navigation"]')

export const searchProfileTabListLastChildSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>(
        '[data-testid="primaryColumn"] div + [role="navigation"][aria-label] [data-testid="ScrollSnap-nextButtonWrapper"]',
    )

export const searchProfileTabPageSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>(
        '[data-testid="primaryColumn"] [role="navigation"] + * > div[aria-label]:not([role="progressbar"])',
    )

export const searchProfileTabLoseConnectionPageSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>(
        '[data-testid="primaryColumn"] [role="navigation"] + * > div[dir="auto"]:not([role="progressbar"])',
    )

export const searchProfileEmptySelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[data-testid="primaryColumn"] [data-testid="emptyState"]')
export const searchProfileActiveTabSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[aria-label][role="navigation"]  [role="tablist"] [role="tab"][aria-selected="true"]')
export const searchProfileTabSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[aria-label][role="navigation"]  [role="tablist"] [role="tab"][aria-selected="false"]')
export const searchAllProfileTabSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[aria-label][role="navigation"]  [role="tablist"] [role="tab"]')
export const searchAppBarBackSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[data-testid="app-bar-back"] > div')
export const searchProfileActiveTabStatusLineSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[aria-label][role="navigation"]  [role="tablist"] [role="tab"][aria-selected="true"] > div > div')
export const searchProfileActiveTabLabelSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[aria-label][role="navigation"] [role="tablist"] [role="tab"][aria-selected="true"] > div')
export const searchProfileTabListSelector = () =>
    querySelectorAll('[aria-label][role="navigation"]  [role="tablist"][data-testid="ScrollSnap-List"] a')
export const searchForegroundColorSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[data-testid="primaryColumn"] > div > div > div > div > div > div > div > div > div > div')
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
    querySelector<E>('head > meta[property="og:image"]:last-child')

export const profileFollowButtonSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>(
        '[data-testid="primaryColumn"] [aria-haspopup="menu"][data-testid="userActions"] ~ [data-testid="placementTracking"]',
    )
// To get margin bottom of menu button, and apply it to tip button to align it.
export const profileMenuButtonSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[data-testid="primaryColumn"] [aria-haspopup="menu"][data-testid="userActions"]')

export const searchEditProfileSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[data-testid="primaryColumn"] a[href="/settings/profile"]')
export const bioCardSelector = <SingleMode extends boolean = true>(singleMode = true) =>
    querySelector<HTMLDivElement, SingleMode>(
        [
            '.profile', // legacy twitter
            'a[href*="header_photo"] ~ div', // new twitter
            'div[data-testid="primaryColumn"] > div > div:last-child > div > div > div > div ~ div', // new twitter without header photo
        ].join(),
        singleMode,
    )
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
        ].join(),
    )
export const composeAnchorTextSelector: () => LiveSelector<HTMLAnchorElement, true> = () =>
    querySelector<HTMLAnchorElement>(
        'header[role=banner] a[href="/compose/tweet"] div[dir],aside a[href="/compose/tweet"] div[dir]',
    )
export const headingTextSelector: () => LiveSelector<HTMLAnchorElement, true> = () =>
    querySelector<HTMLAnchorElement>('[role="banner"] [role="heading"]')

export const postEditorContentInPopupSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>(
        '[aria-labelledby="modal-header"] > div:first-child > div:first-child > div:first-child > div:nth-child(3)',
    )
export const postEditorInPopupSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[aria-labelledby="modal-header"]  div[data-testid="toolBar"] div[data-testid="geoButton"]')
export const toolBoxInSideBarSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[role="banner"] [role="navigation"] > div')
export const sideBarProfileSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[role="banner"] [role="navigation"] [aria-label="Profile"] > div')
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
    querySelector<E>('[role="main"] [data-testid="primaryColumn"] [role="region"] > [role="heading"]')

export const postEditorToolbarSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[data-testid="toolBar"] > div > *:last-child')

export const twitterMainAvatarSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[data-testid="toolBar"]')
        .closest<HTMLElement>(4)
        .querySelector<HTMLElement>('div > a > div > :nth-child(2) > div')

export const newPostButtonSelector = () => querySelector<E>('[data-testid="SideNav_NewTweet_Button"]')

export const profileBioSelector = () => querySelector<HTMLDivElement>('[data-testid="UserDescription"]')

export const personalHomepageSelector = () => querySelector<HTMLDivElement>('[data-testid="UserUrl"]')

export const bioPageUserNickNameSelector = () =>
    querySelector<HTMLDivElement>('[data-testid="UserDescription"]')
        .map((x) => x.parentElement?.parentElement?.previousElementSibling)
        .querySelector<HTMLDivElement>('div[dir]')
export const bioPageUserIDSelector = (selector: () => LiveSelector<HTMLSpanElement, true>) =>
    selector().map((x) => (x.parentElement?.nextElementSibling as HTMLElement)?.innerText?.replace('@', ''))
export const floatingBioCardSelector = () =>
    querySelector<HTMLSpanElement>(
        '[style~="left:"] a[role=link] > div:first-child > div:first-child > div:first-child[dir="auto"]',
    )

export const postsImageSelector = (node: HTMLElement) =>
    new LiveSelector([node]).querySelectorAll<HTMLElement>(
        [
            '[data-testid="tweet"] > div > div img[src*="media"]', // image in timeline page for new twitter
            '[data-testid="tweet"] ~ div img[src*="media"]', // image in detail page for new twitter
        ].join(),
    )

export const timelinePostContentSelector = () =>
    querySelectorAll(
        [
            '[data-testid="tweet"] div + div div[lang]', // text tweets
            '[data-testid="tweet"] div + div div[data-testid="card.wrapper"]', // link box tweets
        ].join(),
    )

export const postsContentSelector = () =>
    querySelectorAll(
        [
            // tweets on timeline page
            '[data-testid="tweet"] div + div div[lang]', // text tweets
            '[data-testid="tweet"] div + div div[data-testid="card.wrapper"]', // link box tweets

            // tweets on detailed page
            '[data-testid="tweet"] + div > div:first-child div[lang]', // text tweets
            '[data-testid="tweet"] + div > div div[data-testid="card.wrapper"]', // link box tweets

            // quoted tweets
            '[data-testid="tweet"] + div div[role="link"] div[lang]',
            '[data-testid="tweet"] > div:last-child div[role="link"] div[lang]',

            // reply-tweets
            '[data-testid="tweet"] + div div div[lang][dir]',
        ].join(),
    ).concat(
        querySelectorAll('[data-testid="tweet"] > div:last-child').map((x) => {
            const textElement = x.querySelector('[role="group"]')?.parentElement?.querySelector('div[lang]') as
                | HTMLDivElement
                | undefined

            if (textElement) return textElement

            // There's no textElement as there's only a twitter summary card parsed by a single url.
            const summaryCardElement = x
                .querySelector('[role="group"]')
                ?.parentElement?.querySelector('[data-testid="card.wrapper"]')?.previousElementSibling as
                | HTMLDivElement
                | undefined

            return summaryCardElement
        }), // timeline page for new twitter
    )

export const postAvatarsContentSelector = () =>
    querySelectorAll('[data-testid="tweet"] > div > div > div > :nth-child(2)')

// #region self info
export const searchSelfHandleSelector = () => {
    return querySelector<HTMLSpanElement>(
        [
            '[data-testid="SideNav_AccountSwitcher_Button"] [dir="ltr"] span', // desktop
            '#layers [role="group"] [role="dialog"] [role="link"] [dir="ltr"] span', // sidebar opened in mobile
        ].join(),
    )
}

export const searchSelfNicknameSelector = () => {
    return querySelector<HTMLSpanElement>(
        [
            '[data-testid="SideNav_AccountSwitcher_Button"] [dir="auto"] span span', // desktop
            '#layers [role="group"] [role="dialog"] [role="link"] span span', // sidebar opened in mobile
        ].join(),
    )
}

export const searchSelfAvatarSelector = () => {
    return querySelector<HTMLImageElement>(
        [
            '#layers ~ div [role="banner"] [role="button"] img', // desktop
            '[data-testid="DashButton_ProfileIcon_Link"] [role="presentation"] img', // topbar in mobile
            '#layers [role="group"] [role="dialog"] [role="link"] img', // sidebar opened in mobile
        ].join(),
    )
}
// #endregion

// #region twitter nft avatar
export const searchProfileAvatarSelector = () => {
    return querySelectorAll<E>('[data-testid="fileInput"]').at(1).closest<E>(4)
}

export const searchProfileAvatarParentSelector = () =>
    querySelectorAll<HTMLDivElement>('[data-testid="fileInput"]').at(1).closest<HTMLDivElement>(2).evaluate()[0]
        .firstChild?.firstChild?.lastChild?.firstChild as HTMLDivElement

export const searchAvatarSelectorInput = () =>
    querySelectorAll<E>('[data-testid="fileInput"]')
        .at(1)
        .closest<HTMLDivElement>(2)
        .querySelector<HTMLDivElement>('div > div > :nth-child(2) > div > :first-child')
export const searchAvatarSelectorImage = () =>
    querySelectorAll<HTMLDivElement>('[data-testid="fileInput"]')
        .at(1)
        .closest<HTMLDivElement>(2)
        .querySelector<HTMLDivElement>('div > div > :nth-child(2) > div > img')

export const searchTwitterAvatarOpenFilesSelector = () => querySelectorAll<E>('[data-testid="fileInput"]').at(1)
export const searchProfileSaveSelector = () => querySelector<E>('[data-testid="Profile_Save_Button"]')

export const searchProfessionalButtonSelector = () => querySelector<E>('[data-testid*="ProfessionalButton"]')

export const searchProfileSetAvatarSelector = () =>
    isMobileTwitter
        ? searchProfessionalButtonSelector()
              .closest<E>(4)
              .querySelector('div > div:nth-child(2) >div > div:nth-child(2)')
        : querySelector<E>('[data-testid^="ProfileBirthdate"]')
              .closest<E>(5)
              .querySelector('div > div:nth-child(2) > div:nth-child(2)')
// #endregion

// #region avatar selector
export const searchTwitterAvatarLinkSelector: () => LiveSelector<E, true> = () =>
    querySelector<E, true>('[data-testid="UserProfileHeader_Items"]').closest<E>(2).querySelector('div  a')

export const searchTwitterAvatarSelector = () =>
    querySelector<E, true>('a[href$="/photo"]').querySelector('img').closest<E>(1)
// #endregion

// #region twitter avatar
export const searchUseCellSelector = () => querySelector<E>('[data-testid="UserCell"]')
// #endregion

export const searchTweetAvatarSelector = () =>
    querySelector<E, false>('[data-testid="tweetButtonInline"]').closest<E>(7)

export const searchRetweetAvatarSelector = () => querySelector<E, false>('[data-testid="tweetButton"]').closest<E>(6)

export const searchTwitterAvatarNFTSelector = () =>
    querySelector<E>('a[href$="/nft"]').closest<E>(1).querySelector('a div:nth-child(3) > div')

export const searchTwitterAvatarNFTLinkSelector = () => querySelector<E>('a[href$="/nft"]')

export const searchReplyToolbarSelector = () =>
    querySelector<E>('div[data-testid="primaryColumn"] div[data-testid="toolBar"]').querySelector<E>(
        'div[data-testid="geoButton"]',
    )

export const searchRejectReplyTextSelector = () =>
    querySelector<E>('div[data-testid="tweetTextarea_0"] > div > div > div > span')
