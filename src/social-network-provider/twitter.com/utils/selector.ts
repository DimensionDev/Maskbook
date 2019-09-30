import { LiveSelector } from '@holoflows/kit'
import { regexMatch } from '../../../utils/utils'
import { postBoxInPopup } from './postBox'

const querySelector = <T extends HTMLElement>(selector: string) => {
    return new LiveSelector().querySelector<T>(selector).enableSingleMode()
}

const querySelectorAll = <T extends HTMLElement>(selector: string) => {
    return new LiveSelector().querySelectorAll<T>(selector)
}

/**
 * @naming
 * 御坂       (@Misaka_xxxx)
 * name       handle
 * userName   screenName
 */

export const rootSelector = () => querySelector<HTMLElement>('body')

export const bioQueryString = '[href*="header_photo"] + div [data-testid="UserDescription"]' // TODO: this is invalid

export const bioCard = () =>
    querySelector('[href*="photo"]')
        .map(x => x.parentElement!.parentElement)
        .querySelector('[data-testid="UserDescription"]')
        .map(x => x.parentElement!.parentElement)

export const postViewMain = () =>
    querySelector<HTMLElement>('[role="progressbar"] + div + div > div > div > div:first-of-type')

const postEditor = () =>
    postBoxInPopup() ? '[aria-labelledby="modal-header"]' : '[role="main"] [role="progressbar"] ~ div'

export const newPostEditorBelow = () => querySelector<HTMLDivElement>(`${postEditor()} > div`)
export const newPostEditorSelector = () => querySelector<HTMLDivElement>(`${postEditor()} .DraftEditor-root`)
export const newPostEditorFocusAnchor = () =>
    querySelector<HTMLDivElement>(`${postEditor()} .public-DraftEditor-content`)
export const newPostEditorHasFocus = () => querySelector(`${postEditor()} .public-DraftEditorPlaceholder-hasFocus`)

export const postPopupInjectPointSelector = () =>
    querySelector('[aria-labelledby="modal-header"] [role="progressbar"] ~ div ~ div')

export const gotoProfileButtonSelector = () => querySelector('[role="navigation"] [aria-label="Profile"]')
export const editProfileButtonSelector = () =>
    querySelector<HTMLAnchorElement>('[data-testid="primaryColumn"] [href="/settings/profile"]')
export const editProfileTextareaSelector = () => querySelector<HTMLTextAreaElement>('textarea[placeholder*="bio"]')

export const postsRootSelector = () => querySelector<HTMLElement>(`[data-testid="primaryColumn"] section`)

export const postsSelectors = () => querySelectorAll('article')
export const postsContentSelectors = () => postsSelectors().querySelectorAll<HTMLElement>(`[lang]`)
export const fromPostSelectorsSelectPostContentString = '[data-testid="tweet"] > div:nth-of-type(2)'

// self infos
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
    screenName: p(name, 1),
    name: p(name, 2),
    bio: p(bio, 1),
    userAvatar: p(avatar, 1),
})
