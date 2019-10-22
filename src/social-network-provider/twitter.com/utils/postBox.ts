import { sleep, untilDocumentReady } from '../../../utils/utils'
import { newPostEditorFocusAnchor, newPostEditorSelector } from './selector'
import { equal } from '../../../utils/assert'
import { untilElementAvailable } from '../../../utils/holoflowKits'

export const postBoxInPopup = () => {
    return window.location.pathname.includes('compose')
}

export const getFocus = async () => {
    await untilDocumentReady()
    await untilElementAvailable(newPostEditorSelector())

    const i = newPostEditorFocusAnchor().evaluate()!

    if (!hasFocus(i)) {
        try {
            i.focus()
        } catch {
            await requestManualClick()
        }
    }

    equal(hasFocus(i), true, 'Failed to get focus')
}

const hasFocus = (x: HTMLElement) => document.activeElement === x

const requestManualClick = async () => {
    const i = newPostEditorFocusAnchor().evaluate()!
    alert('Please manually select the post box')
    while (!hasFocus(i)) {
        await sleep(1000)
    }
}

export const getText = () => newPostEditorSelector().evaluate()!.innerText
