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

/**
 * @naming
 * 御坂       (@Misaka_xxxx)
 * name       handle
 * userName   screenName
 */

export const bioQueryString = '[href*="header_photo"] + div [data-testid="UserDescription"]' // TODO: this is invalid

export const bioCard = () => querySelector<HTMLDivElement>('a[href*="header_photo"] ~ div, .profile')

export const newPostButton = () => querySelector<E>('[data-testid="SideNav_NewTweet_Button"]')

const postEditor = () =>
    postBoxInPopup() ? '[aria-labelledby="modal-header"]' : '[role="main"] [role="progressbar"] ~ div'

export const newPostEditorBelow: () => LiveSelector<E, true> = () => querySelector<E>(postEditor())
export const newPostEditorSelector = () => querySelector<HTMLDivElement>(`${postEditor()} .DraftEditor-root`)
export const newPostEditorFocusAnchor = () => querySelector<E>(`${postEditor()} .public-DraftEditor-content`)

export const hasDraftEditor = (x: E | Document = document) => !isNull(x.querySelector('.DraftEditor-root'))

export const postPopupInjectPointSelector = () =>
    querySelector('[aria-labelledby="modal-header"] [role="progressbar"] ~ div ~ div')

export const editProfileButtonSelector = () =>
    querySelector<HTMLAnchorElement>('[data-testid="primaryColumn"] [href="/settings/profile"]')
export const editProfileTextareaSelector = () => querySelector<HTMLTextAreaElement>('textarea[placeholder*="bio"]')

export const postsSelector = () => querySelectorAll('#main_content .timeline .tweet, [data-testid="tweet"]')
export const postsContentSelector = () => querySelectorAll('.tweet-text > div, [data-testid="tweet"] > div > div[lang]')

const base = querySelector<HTMLScriptElement>('#react-root + script')
const name = /"session":{.*?"user":{.*?"screen_name":"(.*?)","name":"(.*?)"}}/
const bio = /"entities":{.*?"users":{.*?"entities":{.*?"[0-9]*":{.*?"description":"(.*?)"/
const avatar = /"entities":{.*?"users":{.*?"entities":{.*?"[0-9]*":{.*?"profile_image_url_https":"(.*?)"/
/**
 * first matched element can be extracted by index zero, followings are all capture groups, if no 'g' specified.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match
 */
const p = (regex: RegExp, index: number) => {
    return base.clone().map(x => regexMatch(x.innerText, regex, index))
}
export const selfInfoSelectors = () => ({
    handle: p(name, 1),
    name: p(name, 2),
    bio: p(bio, 1),
    userAvatar: p(avatar, 1),
})
