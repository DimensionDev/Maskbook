import { LiveSelector } from '@holoflows/kit'
import { regexMatch } from '../../../utils/utils'
import { postBoxInPopup } from './postBox'
import { isNull } from 'lodash-es'

type E = HTMLElement
const querySelector = <T extends E>(selector: string) => {
    return new LiveSelector().querySelector<T>(selector).enableSingleMode()
}
const querySelectorAll = <T extends E>(selector: string) => {
    return new LiveSelector().querySelectorAll<T>(selector)
}

export const bioCard = () =>
    querySelector<HTMLDivElement>(
        [
            '.profile', // legacy twitter
            'a[href*="header_photo"] ~ div', // new twitter
        ].join(),
    )

export const mainSelector = () => querySelector<E>('[role="main"]')

export const newPostButton = () => querySelector<E>('[data-testid="SideNav_NewTweet_Button"]')

const postEditor = () =>
    postBoxInPopup() ? '[aria-labelledby="modal-header"]' : '[role="main"] :not(aside) > [role="progressbar"] ~ div'

export const newPostEditorBelow: () => LiveSelector<E, true> = () =>
    querySelector<E>('[role="main"] :not(aside) > [role="progressbar"] ~ div')
export const newPostEditorSelector = () => querySelector<HTMLDivElement>(`${postEditor()} .DraftEditor-root`)
export const newPostEditorFocusAnchor = () => querySelector<E>(`${postEditor()} .public-DraftEditor-content`)

export const hasDraftEditor = (x: E | Document = document) => !isNull(x.querySelector('.DraftEditor-root'))

export const postPopupInjectPointSelector = () =>
    querySelector('[aria-labelledby="modal-header"] [role="progressbar"] ~ div ~ div')

export const editProfileButtonSelector = () =>
    querySelector<HTMLAnchorElement>('[data-testid="primaryColumn"] [href="/settings/profile"]')
export const editProfileTextareaSelector = () => querySelector<HTMLTextAreaElement>('textarea[placeholder*="bio"]')

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
            '.tweet-text > div', // both timeline and detail page for legacy twitter
            '[data-testid="tweet"] > div > div[lang]', // timeline page for new twitter
            '[data-testid="tweet"] + div[lang]', // detail page for new twitter
            '[data-testid="tweet"] + div > div[lang]', // detail page for new twitter
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
