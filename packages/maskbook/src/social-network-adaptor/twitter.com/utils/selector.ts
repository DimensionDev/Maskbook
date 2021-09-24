import { LiveSelector } from '@dimensiondev/holoflows-kit'
import { regexMatch } from '../../../utils/utils'
import { isCompose } from './postBox'

type E = HTMLElement

const querySelector = <T extends E, SingleMode extends boolean = true>(
    selector: string,
    singleMode: boolean = true,
) => {
    const ls = new LiveSelector<T, SingleMode>().querySelector<T>(selector)
    return (singleMode ? ls.enableSingleMode() : ls) as LiveSelector<T, SingleMode>
}
const querySelectorAll = <T extends E>(selector: string) => {
    return new LiveSelector().querySelectorAll<T>(selector)
}

//#region "Enhanced Profile"
export const searchProfileSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[aria-label][role="navigation"]')
export const searchProfileTabListLastChildSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>(
        '[data-testid="primaryColumn"] > div > :nth-child(2) > div > div > :nth-child(2) > div > :last-child',
    )
export const searchProfileTabPageSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[data-testid="primaryColumn"] [role="region"] [aria-label]')
export const searchProfileEmptySelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[data-testid="primaryColumn"] [data-testid="emptyState"]')
export const searchProfileActiveTabSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[aria-label][role="navigation"]  [role="tablist"] [role="tab"][aria-selected="true"]')
export const searchProfileTabSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[aria-label][role="navigation"]  [role="tablist"] [role="tab"][aria-selected="false"]')
export const searchProfileActiveTabStatusLineSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[aria-label][role="navigation"]  [role="tablist"] [role="tab"][aria-selected="true"] > div > div')
export const searchProfileActiveTabLabelSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[aria-label][role="navigation"] [role="tablist"] [role="tab"][aria-selected="true"] > div')
export const searchProfileTabListSelector = () =>
    querySelectorAll('[aria-label][role="navigation"]  [role="tablist"][data-testid="ScrollSnap-List"] a')
export const searchForegroundColorSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[data-testid="primaryColumn"] > div > div > div > div > div > div > div > div > div > div')
export const searchNewTweetButtonSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[data-testid="SideNav_NewTweet_Button"]')
export const searchNickNameSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[data-testid="UserProfileHeader_Items"]')
export const searchAvatarSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[data-testid="primaryColumn"] a[role="link"][href$="/photo"] img')
export const searchHeaderPhotoSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[data-testid="primaryColumn"] a[role="link"][href$=/header_photo] img')
export const bioCardSelector = <SingleMode extends boolean = true>(singleMode = true) =>
    querySelector<HTMLDivElement, SingleMode>(
        [
            '.profile', // legacy twitter
            'a[href*="header_photo"] ~ div', // new twitter
            'div[data-testid="primaryColumn"] > div > div:last-child > div > div > div > div ~ div', // new twitter without header photo
        ].join(),
        singleMode,
    )
//#endregion

export const rootSelector: () => LiveSelector<E, true> = () => querySelector<E>('#react-root')

// `aside *` selectors are for mobile mode
export const composeAnchorSelector: () => LiveSelector<HTMLAnchorElement, true> = () =>
    querySelector<HTMLAnchorElement>('header[role=banner] a[href="/compose/tweet"],aside a[href="/compose/tweet"]')
export const composeAnchorTextSelector: () => LiveSelector<HTMLAnchorElement, true> = () =>
    querySelector<HTMLAnchorElement>(
        'header[role=banner] a[href="/compose/tweet"] div[dir],aside a[href="/compose/tweet"] div[dir]',
    )

export const postEditorContentInPopupSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[aria-labelledby="modal-header"] > div:first-child > div:nth-child(3)')
export const postEditorInPopupSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>(
        '[aria-labelledby="modal-header"] > div:first-child > div:nth-child(3) > div:first-child > div:first-child [role="button"][aria-label]:nth-child(6)',
    )
export const toolBoxInSideBarSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[role="banner"] [role="navigation"] > div')
export const postEditorInTimelineSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[role="main"] :not(aside) > [role="progressbar"] ~ div [role="button"][aria-label]:nth-child(6)')
export const postEditorDraftContentSelector = () => {
    if (location.pathname === '/compose/tweet') {
        return querySelector<HTMLDivElement>(
            `[contenteditable][aria-label][spellcheck],textarea[aria-label][spellcheck]`,
        )
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

export const bioDescriptionSelector = () => querySelector<HTMLDivElement>('[data-testid="UserDescription"]')

export const bioPageUserNickNameSelector = () =>
    querySelector<HTMLDivElement>('[data-testid="UserDescription"]')
        .map((x) => x.parentElement?.parentElement?.previousElementSibling)
        .querySelector<HTMLDivElement>('div[dir]')
export const bioPageUserIDSelector = (selector: () => LiveSelector<HTMLSpanElement, true>) =>
    selector().map((x) => (x.parentElement?.nextElementSibling as HTMLElement).innerText.replace('@', ''))
export const floatingBioCardSelector = () =>
    querySelector<HTMLSpanElement>(
        `[style~="left:"] a[role=link] > div:first-child > div:first-child > div:first-child[dir="auto"]`,
    )

export const postsImageSelector = (node: HTMLElement) =>
    new LiveSelector([node]).querySelectorAll<HTMLElement>(
        [
            '[data-testid="tweet"] > div > div img[src*="media"]', // image in timeline page for new twitter
            '[data-testid="tweet"] ~ div img[src*="media"]', // image in detail page for new twitter
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

export const postAvatarsContentSelector = () => querySelectorAll('[data-testid="tweet"] > div')
const base = querySelector<HTMLScriptElement>('#react-root + script')
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

//#region nft avatar
export const searchProfileAvatarSelector = () => querySelectorAll<E>('[data-testid="fileInput"]').at(1).closest<E>(4)

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

export const searchAvatarOpenFileSelector = () => querySelectorAll<E>('[data-testid="fileInput"]').at(0)
export const searchProfileSaveSelector = () => querySelector<E>('[data-testid="Profile_Save_Button"]')
export const searchProfileCloseSelector = () => querySelector<E>('[data-testid="app-bar-close"]')
//#endregion

//#region avatar selector

export const searchTwitterAvatarSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[data-testid="primaryColumn"] > div > :nth-child(2) > div > div > div > :nth-child(2) > div > a')
//#endregion

//#region twitter avatar
export const searchAccountSwitherButtonSelector = () =>
    querySelector<E>('[data-testid="SideNav_AccountSwitcher_Button"]')

export const searchUseCellSelector = () => querySelector<E>('[data-testid="UserCell"]')
//#endregion
