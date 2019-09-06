import { LiveSelector } from '@holoflows/kit'
import { regexMatch } from '../../../utils/utils'

const querySelector = <T extends HTMLElement>(selector: string) => {
    return new LiveSelector().querySelector<T>(selector).enableSingleMode()
}

const querySelectorAll = <T extends HTMLElement>(selector: string) => {
    return new LiveSelector().querySelectorAll<T>(selector)
}

/**
 * @naming
 * 御坂       (@Misaka_xxxx)
 * userName   screenName
 */

export const rootSelector = () => querySelector<HTMLElement>('body')

export const bioQueryString = '[href*="header_photo"] + div [data-testid="UserDescription"]'

export const bioCard = () => querySelector('[href*="header_photo"] + div')
export const postViewMain = () =>
    querySelector<HTMLElement>('[role="progressbar"] + div + div > div > div > div:first-of-type')

const newPostEditor = '[role="main"] [role="progressbar"] ~ div'
export const newPostEditorBelow = () => querySelector<HTMLDivElement>(`${newPostEditor} > div`)
export const newPostEditorSelector = () => querySelector<HTMLDivElement>(`${newPostEditor} .DraftEditor-root`)
export const newPostEditorInnerSelector = () =>
    newPostEditorSelector().querySelector<HTMLDivElement>('.DraftEditor-editorContainer > div')

export const editProfileButtonSelector = () =>
    querySelector<HTMLAnchorElement>('[data-testid="primaryColumn"] [href="/settings/profile"]')
export const editProfileTextareaSelector = () => querySelector<HTMLTextAreaElement>('textarea[placeholder*="bio"]')

export const postsRootSelector = () => querySelector<HTMLElement>(`[data-testid="primaryColumn"] section`)

export const postPopupSelector = () => querySelector('[aria-labelledby="modal-header"]')
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
    userName: p(name, 2),
    userBio: p(bio, 1),
    userAvatar: p(avatar, 1),
})
