import { LiveSelector } from '@holoflows/kit'
import { regexMatch } from '../../../utils/utils'
import { PersonIdentifier } from '../../../database/type'
import { host } from '../index'
import { isNull } from 'lodash-es'

const querySelector = (selector: string) => {
    return new LiveSelector().querySelector<HTMLAnchorElement>(selector)
}

/**
 * @naming
 * 御坂       (@Misaka_xxxx)
 * userName   screenName
 */

const base = querySelector('script')
const name = /"session":{.*?"user":{.*?"screen_name":"(.*?)","name":"(.*?)"}}/
const bio = /"entities":{.*?"users":{.*?"entities":{.*?"[0-9]*":{.*?"description":"(.*?)"/
const avatar = /"entities":{.*?"users":{.*?"entities":{.*?"[0-9]*":{.*?"profile_image_url_https":"(.*?)"/

// const demoFactory = (regex: RegExp, index: number) => {
//     return base.clone().map(x => regexMatch(x.innerText, regex, index))
// }

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

const personIdentifierLiveSelectorFactory = (regex: RegExp, index: number) => {
    return base.clone().map(x => toPersonIdentifier(x, regex, index))
}

const toPersonIdentifier = (x: HTMLElement, regex: RegExp, index: number) => {
    const r = regexMatch(x.innerText, regex, index)
    if (isNull(r)) {
        return PersonIdentifier.unknown
    }
    return new PersonIdentifier(host, r)
}

export const screenNameSelector = personIdentifierLiveSelectorFactory(name, 0)
// export const userNameSelector = factory(name, 1)
// export const userBioSelector = factory(bio, 0)
// export const userAvatarUrlSelector = factory(avatar, 0)
