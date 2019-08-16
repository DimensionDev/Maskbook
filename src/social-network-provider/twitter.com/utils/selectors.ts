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

export const newPostEditorSelector = querySelector<HTMLDivElement>('[role="main"] [role="progressbar"] ~ div .DraftEditor-root')

const postsContainerString = '[role="main"] [data-testid="primaryColumn"] section'

// @ts-ignore
export const postsRootSelector = querySelectorAll<Element>(postsContainerString)
export const postsSelectors = querySelectorAll(`${postsContainerString} article`)
