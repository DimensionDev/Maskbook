import { LiveSelector } from '@holoflows/kit'

const querySelector = <T extends HTMLElement>(selector: string) => {
    return new LiveSelector().querySelector<T>(selector)
}

const querySelectorAll = <T extends HTMLElement>(selector: string) => {
    return new LiveSelector().querySelectorAll<T>(selector)
}

/**
 * @naming
 * 御坂       (@Misaka_xxxx)
 * userName   screenName
 */

export const bioCard = querySelector('[href*="header_photo"] + div')
export const postViewMain = querySelector<HTMLElement>('[role="progressbar"] + div + div > div > div > div:first-of-type')

const newPostEditor = '[role="main"] [role="progressbar"] ~ div'
export const newPostEditorSelector = querySelector<HTMLDivElement>(`${newPostEditor} .DraftEditor-root`)
export const newPostEditorInnerSelector = newPostEditorSelector.querySelector<HTMLDivElement>('.DraftEditor-editorContainer > div')

const postsContainerString = '[role="main"] [data-testid="primaryColumn"] section'

export const postsRootSelector = querySelectorAll<HTMLElement>(postsContainerString)
export const postsSelectors = querySelectorAll(`${postsContainerString} article`)
