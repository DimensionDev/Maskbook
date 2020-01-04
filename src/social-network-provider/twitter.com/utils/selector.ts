import { LiveSelector } from '@holoflows/kit'
import { regexMatch } from '../../../utils/utils'
import { isCompose, isMobile } from './postBox'

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

export const rootSelector: () => LiveSelector<E, true> = () => querySelector<E>('#react-root')

export const postEditorInPopupSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[aria-labelledby="modal-header"] > div:first-child > div:nth-child(3)')
export const postEditorInTimelineSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[role="main"] :not(aside) > [role="progressbar"] ~ div')
export const postEditorDraftContentSelector = () =>
    (isCompose() ? postEditorInPopupSelector() : postEditorInTimelineSelector()).querySelector<HTMLElement>(
        '.public-DraftEditor-content, textarea[aria-label="Tweet text"]',
    )

export const newPostButtonSelector = () => querySelector<E>('[data-testid="SideNav_NewTweet_Button"]')

export const profileEditorButtonSelector = () =>
    querySelector<HTMLAnchorElement>('[data-testid="primaryColumn"] [href="/settings/profile"]')
export const profileEditorTextareaSelector = () => querySelector<HTMLTextAreaElement>('textarea[placeholder*="bio"]')

export const bioSelector = () => querySelector<HTMLDivElement>(['[data-testid="UserProfileHeader_Items"]'].join())
export const bioCardSelector = <SingleMode extends boolean = true>(singleMode = true) =>
    querySelector<HTMLDivElement, SingleMode>(
        [
            '.profile', // legacy twitter
            'a[href*="header_photo"] ~ div', // new twitter
            'div[data-testid="primaryColumn"] > div > div:last-child > div > div > div > div ~ div', // new twitter without header photo
        ].join(),
        singleMode,
    )

export const postsSelector = () =>
    querySelectorAll(
        [
            '#main_content .timeline .tweet', // legacy twitter
            '[data-testid="tweet"]', // new twitter
        ].join(),
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
            // 'article > div[lang]', // TODO: this selector maybe works in new twitter test is required
            '.tweet-text > div', // both timeline and detail page for legacy twitter
            '[data-testid="tweet"] > div > div[lang]', // timeline page and tread page for new twitter
            '[data-testid="tweet"] + div > div[lang]', // detail page for new twitter
            '[data-testid="tweet"] ~ div[lang]', // detail page for new twitter
            '[data-testid="tweet"] [role="blockquote"] div[lang]', // timeline page retweet quote block for new twitter
            '[data-testid="tweet"] ~ div [role="blockquote"] div[lang]', // detail page retweet quote block for new twitter
        ].join(),
    )

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
    return base.clone().map(x => regexMatch(x.innerText, regex, index))
}
export const selfInfoSelectors = () => ({
    handle: p(handle, 1),
    name: p(name, 1),
    bio: p(bio, 1),
    userAvatar: p(avatar, 1),
})
