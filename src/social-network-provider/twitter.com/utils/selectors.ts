import { LiveSelector } from '@holoflows/kit'
import { regexMatch } from '../../../utils/utils'

const querySelector = <T extends Element>(selector: string) => {
    return new LiveSelector().querySelector<T>(selector)
}

/**
 * @naming
 * 御坂       (@Misaka_xxxx)
 * userName   screenName
 */

const base = querySelector<HTMLScriptElement>('#react-root + script')
export const bioCard = querySelector<HTMLDivElement>('#react-root [href*="header_photo"] + div')

const name = /"session":{.*?"user":{.*?"screen_name":"(.*?)","name":"(.*?)"}}/
const uid = /"entities":{.*?"users":{.*?"entities":{.*?"[0-9]*":{.*?"id_str":"(.*?)"/
const bio = /"entities":{.*?"users":{.*?"entities":{.*?"[0-9]*":{.*?"description":"(.*?)"/
const avatar = /"entities":{.*?"users":{.*?"entities":{.*?"[0-9]*":{.*?"profile_image_url_https":"(.*?)"/

const newPostEditorString = '[role="main"] [role="progressbar"] + div'

export const newPostEditorContainerSelector = querySelector(newPostEditorString)
export const newPostEditorSelector = querySelector(`${newPostEditorString} .DraftEditor-root`)
export const newPostEditorOnFocusSelector = querySelector(
    `${newPostEditorString} .DraftEditor-root .public-DraftEditorPlaceholder-hasFocus`,
)

const newCommentEditorString = `[aria-labelledby="modal-header"] .DraftEditor-root`

export const newCommentEditorSelector = querySelector(newCommentEditorString)

export const timelineSelector = querySelector(
    '[role="main"] [data-testid="primaryColumn"] section > div > div > div > *',
)

const p = (regex: RegExp, index: number) => {
    return base.clone().map(x => regexMatch(x.innerText, regex, index))
}

const userInfoSelectors = {
    screenName: p(name, 0),
    userName: p(name, 1),
    userId: p(uid, 0),
    userBio: p(bio, 0),
    userAvatar: p(avatar, 0),
}

const u = userInfoSelectors;
type t = typeof u;
type k = keyof t;
export const userInfos = new Proxy(userInfoSelectors, {
    get(target: typeof userInfoSelectors, p: keyof typeof userInfoSelectors) {
        return target[p].evaluateOnce()[0];
    }
}) as unknown as Record<k, string | undefined>
